import express from 'express';
import { createProduct, getAllProducts,deleteProduct, updateProduct,getProductById } from "../controllers/productController.js";

const productRouter = express.Router();

productRouter.post("/",createProduct);

productRouter.get("/",getAllProducts);


productRouter.get("/trending",(req,res)=>{
    res.json({
        message: "Trending products will be here"
    });
});
      //id thiyena ewa pallehta danna hemathissema
productRouter.get("/:productID",getProductById);

productRouter.delete("/:productID",deleteProduct);//: kiyanne agta dala ewnne value ekk kiyala

productRouter.put("/:productID",updateProduct); 

export default productRouter;
