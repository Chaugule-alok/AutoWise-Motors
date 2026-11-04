"""Train AutoWise on REAL Indian-market data.

CSV target schema:
make,model,variant,year,registration_month,km,fuel,transmission,owners,services,color,condition,city,original_price_inr,market_price_inr

Do not invent target prices. Use real historical/listing/transaction observations.
"""
import sys, re
from pathlib import Path
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from catboost import CatBoostRegressor

FEATURES=["make","model","variant","year","km","fuel","transmission","owners","services","color","condition","city","original_price_inr","age","km_per_year"]
CATS=["make","model","variant","fuel","transmission","color","condition","city"]


def prepare(raw):
    required=set(["make","model","variant","year","km","fuel","transmission","owners","services","color","condition","city","original_price_inr","market_price_inr"])
    missing=required-set(raw.columns)
    if missing: raise ValueError("Missing columns: "+", ".join(sorted(missing)))
    d=raw.copy()
    for c in CATS: d[c]=d[c].fillna("Unknown").astype(str).str.strip()
    for c in ["year","km","owners","services","original_price_inr","market_price_inr"]:
        d[c]=pd.to_numeric(d[c],errors="coerce")
    d["age"]=(2026-d["year"]).clip(lower=0)
    d["km_per_year"]=d["km"]/d["age"].clip(lower=1)
    d=d.dropna(subset=["year","km","market_price_inr","original_price_inr"])
    d=d[(d["market_price_inr"]>25000)&(d["original_price_inr"]>25000)&(d["km"]>=0)]
    medians={}
    for c in FEATURES:
        if c not in CATS:
            d[c]=pd.to_numeric(d[c],errors="coerce")
            medians[c]=float(d[c].median())
            d[c]=d[c].fillna(medians[c])
    return d[FEATURES], d["market_price_inr"].astype(float), medians


def main(path):
    raw=pd.read_csv(path)
    X,y,medians=prepare(raw)
    if len(X)<200: raise SystemExit("Need at least 200 real records; 10,000+ is recommended for a strong project.")
    Xtr,Xte,ytr,yte=train_test_split(X,y,test_size=.20,random_state=42)
    model=CatBoostRegressor(loss_function="MAE",eval_metric="MAE",iterations=1800,depth=9,learning_rate=.035,random_seed=42,l2_leaf_reg=6,verbose=False)
    model.fit(Xtr,ytr,cat_features=CATS,eval_set=(Xte,yte),early_stopping_rounds=150)
    pred=model.predict(Xte)
    mae=mean_absolute_error(yte,pred); rmse=mean_squared_error(yte,pred)**.5; r2=r2_score(yte,pred)
    q90=float(np.quantile(np.abs(yte.to_numpy()-pred),.90))
    median=float(np.median(yte))
    reliability=max(0,min(95,100*(1-mae/max(median,1))))
    meta={
        "schema_version":2,"model_name":"CatBoost Regressor (AutoWise India)","feature_schema":FEATURES,"categorical_features":CATS,
        "numeric_defaults":medians,"mae":float(mae),"rmse":float(rmse),"r2":float(r2),"absolute_error_q90":q90,
        "reliability_score":reliability,"train_rows":len(Xtr),"test_rows":len(Xte),"max_training_year":int(X["year"].max()),"currency":"INR"
    }
    out=Path(__file__).resolve().parent/"models"/"price_model.joblib"
    joblib.dump({"model":model,"meta":meta},out,compress=3)
    print(f"Rows: {len(X)} | MAE ₹{mae:,.0f} | RMSE ₹{rmse:,.0f} | R² {r2:.4f} | q90 ±₹{q90:,.0f}")
    print("Saved:",out)

if __name__=="__main__":
    if len(sys.argv)!=2: raise SystemExit("Usage: python train_price_model.py data/vehicle_training.csv")
    main(sys.argv[1])
