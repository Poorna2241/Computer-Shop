import Product from "../models/Product.js";
import { isAdmin } from "./userController.js";

export function createProduct(req,res){


    if( ! isAdmin(req)){
        res.status(403).json({
            message: "Access denied. Admins only."
        })
        return;
    }

    const product = new Product(req.body);

    product.save().then(()=>{
        res.json({
            message: "Product created successfully"
        });
    }).catch((error)=>{
        res.status(500).json({
            message: "Error creating product",
            error: error.message
        })}) 
    

}

export async function getAllProducts(req,res){

try{

    
    if( isAdmin(req)){
        // Product.find().then(
        //     (products)=>{
        //         res.json(products);
        //     }
        // ).catch((error)=>{
        //     res.status(500).json({
        //         message: "Error retrieving products",
        //         error: error.message
        //     })
        // });

        
             const products = await Product.find();
       
       
    }else{

        Product.find({isAvailable: true}).then(
            (products)=>{
                res.json(products);
            }
        ).catch((error)=>{
            res.status(500).json({
                message: "Error retrieving products",
                error: error.message
            })
        });
    }

    

}catch(error){
    res.status(500).json({
        message: "Error retrieving products",
        error: error.message
    })
}

}

export function deleteProduct(req,res){
    if( ! isAdmin(req)){
        res.status(403).json({
            message: "Access denied. Admins only can delete products."
        })
        return;
    }

    const productID = req.params.productID;

    Product.deleteOne({productID: productID}).then(()=>{
        res.json({
            message: "Product deleted successfully"
        });
    }).catch((error)=>{
        res.status(500).json({
            message: "Error deleting product",
            error: error.message
        })
    });
}

export function updateProduct(req,res){
    if( ! isAdmin(req)){
        res.status(403).json({
            message: "Access denied. Admins only can update products."
        })
        return;
    }

    const productID = req.params.productID;

    Product.updateOne({productID: productID}, req.body).then(()=>{
        res.json({
            message: "Product updated successfully"
        });
    }).catch((error)=>{
        res.status(500).json({
            message: "Error updating product",
            error: error.message
        })
    });
}

export function getProductById(req,res){
    const productID = req.params.productID;     
    Product.findOne({productID: productID}).then(
        (product)=>{
            if(product == null){
                res.status(404).json({
                    message: "Product not found"
                });
                return;
            }else{
                if(product.isAvailable || isAdmin(req)){
                    res.json(product);
                }else{
                    res.status(403).json({
                        message: "Access denied. Product is not available."
                    });
                }
            }
        }
    ).catch((error)=>{
        res.status(500).json({
            message: "Error retrieving product",
            error: error.message
        })
    });

    
}
