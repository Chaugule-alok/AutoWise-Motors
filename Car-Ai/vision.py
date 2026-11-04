from pathlib import Path
import cv2
import numpy as np

DAMAGE_CLASSES = {
    "dent": {"base_repair": 8000},
    "scratch": {"base_repair": 3500},
    "crack": {"base_repair": 9000},
    "broken_lamp": {"base_repair": 12000},
    "glass_damage": {"base_repair": 10000},
    "paint_damage": {"base_repair": 5000},
    "bumper_damage": {"base_repair": 10000},
}

class DamageAnalyzer:
    """Real-detection-only damage layer.

    A custom YOLO model trained on vehicle-damage annotations must be placed at
    models/car_damage.pt. No random/fake detections are generated.
    """
    def __init__(self, model_path: Path):
        self.model_path = Path(model_path)
        self.model = None
        if self.model_path.exists():
            try:
                from ultralytics import YOLO
                self.model = YOLO(str(self.model_path))
            except Exception as exc:
                print("Could not load damage model:", exc)

    def analyze(self, paths):
        video_uploaded = any(p.suffix.lower() in {".mp4",".mov",".avi",".mkv",".webm"} for p in paths)
        if self.model is None:
            return {
                "model_ready": False,
                "message": "Damage AI is not installed yet. Upload a trained vehicle-damage model to enable verified dent/scratch detection.",
                "findings": [], "repair_estimate": 0, "price_adjustment_pct": 0,
                "frames_analyzed": 0, "media_count": len(paths), "video_uploaded": video_uploaded
            }

        findings=[]; frames=[]
        for p in paths:
            if p.suffix.lower() in {".mp4",".mov",".avi",".mkv",".webm"}:
                frames.extend(self._sample_video(p, 12))
            else:
                frames.append(str(p))
        for source in frames:
            try:
                results=self.model(source, conf=0.35, verbose=False)
                for result in results:
                    names=result.names; boxes=result.boxes
                    if boxes is None: continue
                    for b in boxes:
                        conf=float(b.conf[0].item()); cls_id=int(b.cls[0].item())
                        label=str(names.get(cls_id,cls_id)).lower().replace(" ","_")
                        xyxy=[round(float(x),2) for x in b.xyxy[0].tolist()]
                        findings.append({"type":label,"confidence":round(conf*100,1),"box":xyxy,"source":str(source)})
            except Exception as exc:
                print("Vision inference failed:", source, exc)

        findings=sorted(findings,key=lambda x:x["confidence"],reverse=True)[:30]
        repair=0
        for f in findings:
            info=DAMAGE_CLASSES.get(f["type"], {"base_repair":5000})
            c=f["confidence"]
            severity=1.0 if c<60 else 1.35 if c<80 else 1.7
            repair += int(info["base_repair"]*severity)
        # Repair cost is converted to a conservative market discount.
        adjustment=-min(25.0, repair/500000*100*1.15) if repair else 0
        msg=("Verified vehicle-damage model analyzed the supplied media." if findings else
             "No verified dents/scratches were detected in the supplied media. This is not proof that the vehicle is damage-free.")
        return {
            "model_ready": True, "message": msg, "findings": findings,
            "repair_estimate": int(repair), "price_adjustment_pct": round(adjustment,2),
            "frames_analyzed": len(frames), "media_count": len(paths), "video_uploaded": video_uploaded
        }

    def _sample_video(self, path, max_frames=12):
        cap=cv2.VideoCapture(str(path)); total=int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
        if total<=0: cap.release(); return []
        indices=np.linspace(0,total-1,min(max_frames,total)).astype(int)
        out=[]; tmpdir=Path(path).parent/"video_frames"; tmpdir.mkdir(exist_ok=True)
        for i in indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES,int(i)); ok,frame=cap.read()
            if ok:
                op=tmpdir/f"{Path(path).stem}_{i}.jpg"; cv2.imwrite(str(op),frame); out.append(str(op))
        cap.release(); return out
