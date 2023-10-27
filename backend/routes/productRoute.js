const express = require("express");
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetails,
  createProductReview,
  getProductReviews,
  deleteReview,
  getAdminProducts,
  getSingleProduct,
  getProUrl,
  addProduct,
  getSettings,
} = require("../controllers/productController");
const { getUrllist, plans, updateUrls, updatePlans, deleteUrl, deletePlan, getPlanById, singlePlan, updatePlan, getAllStreamUrls } = require("../controllers/url_controller");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.route("/products/:customerid").get(getAllProducts);

router
  .route("/product/:id")
  .get(getSingleProduct)
  .delete(deleteProduct);

// router.route("/gets").post(getSettings);

router
  .route("/admin/products")
  .get(getAdminProducts);

router
  .route("/product/new")
  .post(addProduct);

router
  .route("/admin/product/:cameraid")
  .get(getSingleProduct)
  .put(updateProduct)
  .delete(deleteProduct);

// router.route("/product").post(getProductDetails);
router.route("/admin/urls").get(getUrllist);

router.route("/admin/plans").get(plans);
router.route("/admin/streamurls").get(getAllStreamUrls);

router.route("/admin/updateurl/:id").put(updateUrls).delete(deleteUrl);
router.route("/admin/updateplan/:id").get(getPlanById).put(updatePlan).delete(deletePlan);


module.exports = router;
