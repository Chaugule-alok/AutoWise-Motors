HOW TO ADD YOUR OWN VEHICLE PHOTOS
==================================

1. Put your photo files inside a folder here, for example:

       Images/Suzuki/front.jpg
       Images/Suzuki/side.jpg

2. Open  js/images.js  and add the paths under the vehicle id.
   The ids are in js/data.js  (cars = c1, c2 ... / bikes = b1, b2 ... /
   trucks = t1, t2 ...). The first path is the card photo, the rest are
   extra photos shown on the detail page:

       const VEHICLE_IMAGES = {
           c1: [
               'Images/Suzuki/front.jpg',
               'Images/Suzuki/side.jpg'
           ],
           b1: ['Images/Enfiled/image (1).jpg']
       };

3. Save and refresh the page. No other file has to be changed.

Notes
-----
* Any vehicle with no photo listed here automatically falls back to an
  online photo, and to a grey "Photo coming soon" box if you are offline,
  so the layout never breaks.
* Spaces in file names are fine - they are encoded automatically.
* Recommended size: about 800 x 520 px, JPG or PNG.
