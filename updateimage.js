
const mongoose = require("mongoose");
const connectDb = require("./config/db");
const Product = require("./models/product");

const productImages = [
    {
        title: "Classic Cotton T-Shirt",
        images: ["/public/images/cotton tshirt.jpg"]
    },
    {
        title: "Slim Fit Jeans",
        images: ["/public/images/jean.png"]}
,    {
        title: "Casual Check Shirt",
        images: ["/public/images/shirt.png"]
    },
    {
        title: "Hooded Sweatshirt",
        images: ["/public/images/sweatshirt.png"]
    },
    {
        title: "Formal Trousers",
        images: ["public/images/trouser.png"]
    },
    {
        title: "Floral Kurti",
        images: ["/public/images/floral.jpg"]
    },
    {
        title: "High Waist Jeans",
        images: ["/public/images/jighwaistedjean.png"]
    },
    {
        title: "Casual Top",
        images: ["/public/images/TOP.png"]
    },
    {
        title: "Summer Dress",
        images: ["/public/images/DRESS.png"]
    },
    {
        title: "Women's Jacket",
        images: ["/public/images/JACKET.png"]
    },
    {
        title: "Wireless Headphones",
        images: ["/public/images/headphone.png"]
    },
    {
        title: "Smart Watch",
        images: ["/public/images/watch.jpg"]
    },
    {
        title: "Bluetooth Speaker",
        images: ["/public/images/bluetooth.jpg"]
    },
    {
        title: "Wireless Mouse",
        images: ["/public/images/mouse.jpg"]
    },
    {
        title: "USB-C Charger",
        images: ["/public/images/charger.jpg"]
    },
    {
        title: "Matte Lipstick",
        images: ["/public/images/lipstick.jpg"]
    },
    {
        title: "Face Moisturizer",
        images: ["/public/images/mouisetrizer.jpg"]
    },
    {
        title: "Volumizing Mascara",
        images: ["/public/images/mascara.jpg"]
    },
    {
        title: "Compact Powder",
        images: ["/public/images/powder.jpg"]
    },
    {
        title: "Nail Polish",
        images: ["/public/images/nailpaint.jpg"]
    }
];

connectDb()
    .then(() => {
        const updates = productImages.map((product) => {
            return Product.findOneAndUpdate(
                { title: product.title },
                { $set: { images: product.images } },
                { new: true }
            ).then((updatedProduct) => {
                if (!updatedProduct) {
                    console.log("Product not found:", product.title);
                    return false;
                }

                console.log("Image updated:", product.title);
                return true;
            });
        });

        return Promise.all(updates);
    })
    .then((results) => {
        const count = results.filter(Boolean).length;
        console.log(`${count} existing products updated.`);
    })
    .catch((error) => {
        console.log("Update failed:", error.message);
    })
    .finally(() => {
        return mongoose.connection.close();
    });
