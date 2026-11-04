AutoWise – how to run
=====================

1) Marketplace (static pages)
   Open a terminal in this folder and run:

       python -m http.server 8899

   Then open http://localhost:8899/index.html
   (Opening index.html by double-click also works, but a local server is
   recommended so images and scripts load the same way everywhere.)

2) Car-Ai (optional, needed for the yellow button)

       cd Car-Ai
       pip install -r requirements.txt
       python app.py

   Runs on http://127.0.0.1:5000/
   The yellow "Upload More Details to Get Best Price" button on index.html
   opens this page when the server is running; if it is not running, the
   page shows the two commands above.

   torch / torchvision are optional. Without them the app still starts and
   uses a simulated damage estimate.

3) Your own photos
   Put images anywhere under Images/ and map them by vehicle id in
   js/images.js. See Images/README.txt for details.

4) Login / signup
   No database is used. Accounts are stored in your browser
   (localStorage key "autowise_users") and the session in
   "autowise_session". "Remember me" keeps you signed in after closing the
   tab. This is fine for a local/demo app but it is not production-grade
   security - do not use real passwords.

Browser data keys: autowise_users, autowise_session, autowise_wishlist,
autowise_viewHistory, autowise_chat_history.
