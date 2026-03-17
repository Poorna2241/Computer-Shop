import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { isAdmin } from "./userController.js";


export async function createOrder(req,res){
    if(req.user==null){
        res.status(401).json({
            message: "Unauthorized"
        });
        return;
    }

    try {
        const latestOrder = await Order.findOne().sort({orderId: -1});

        let orderId = "ORD0001";

        if(latestOrder != null){
            let latestOrderId = latestOrder.orderId;// "ORD0001"
            let latestOrderNumberString = latestOrderId.replace("ORD", ""); // "0001"
            let latestOrderNumber = parseInt(latestOrderNumberString); // 1

            let mewOrderNumber = latestOrderNumber + 1; // 2
            orderId = "ORD" + mewOrderNumber.toString().padStart(4, '0'); // "ORD0002"
            
        }

        const items =[]
        let total = 0;

        for(let i=0; i<req.body.items.length; i++){

            const product = await Product.findOne({ productID: req.body.items[i].productId });

            if(!product){
                res.status(404).json({
                    message: "Product not found"
                });
                return;
            }

            const itemTotal = product.price * req.body.items[i].quantity;
            total += itemTotal;

            items.push({
                productId: product.productID,
                name: product.name,
                price: product.price,
                quantity: req.body.items[i].quantity,
                image: product.images[0]
            });

        }


        let name = req.body.name;

        if(name == null || name.trim() === ""){
            name = req.user.firstName + " " + req.user.lastName;
        }

        const newOrder = new Order({
            orderId: orderId,
            email: req.user.email,
            name: name,
            address: req.body.address,
            total: total,
            items: items,
            phone: req.body.phone,
        
        });

        await newOrder.save();

        res.status(201).json({
            message: "Order created successfully",
            order: newOrder
        });


    } catch (error) {
        return res.status(500).json({
            message: "Error creating order",
            error: error.message
        });
        
    }


}

export async function getOrders(req,res){
    if(req.user==null){
        res.status(401).json({
            message: "Unauthorized"
        });
        return;
    }
    if(isAdmin(req)){
        try {
            const orders = await Order.find().sort({date: -1});
            res.json(orders);
        } catch (error) {
            res.status(500).json({
                message: "Error fetching orders",
                error: error.message
            });
        }
    } else {
        try {
            const orders = await Order.find({ email: req.user.email }).sort({date: -1});
            res.json(orders);
        } catch (error) {
            res.status(500).json({
                message: "Error fetching orders",
                error: error.message
            });
        }
    }
}
export async function updateOrderStatus(req, res) {
	if (!isAdmin(req)) {
		res.status(401).json({
			message: "Unauthorized",
		});
		return;
	}
	try {
		const orderId = req.params.orderId;
		const status = req.body.status;
		const notes = req.body.notes;

		await Order.updateOne(
			{ orderId: orderId },
			{ status: status, notes: notes }
		);

		res.json({
			message: "Order status updated successfully",
		});
	} catch (error) {
		res.status(500).json({
			message: "Error updating order status",
			error: error.message,
		});
	}
}
