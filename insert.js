const mongoose = require("mongoose");
const connectDb = require("./config/db");
const Product = require("./models/product");


    const products = [
    // 1. MEN'S CLOTHING
    {
        title: "Classic Cotton T-Shirt",
        description: "Comfortable cotton T-shirt for everyday wear.",
        images: ["https://placehold.co/600x600?text=Mens+Tshirt"],
        price: 599,
        brand: "Roadster",
        category: "men-clothing",
        stock: 25,
        attributes: { size: "M", color: "Black", material: "Cotton" }
    },
    {
        title: "Slim Fit Jeans",
        description: "Classic slim-fit denim jeans for casual outings.",
        images: ["https://placehold.co/600x600?text=Mens+Jeans"],
        price: 1299,
        brand: "Levis",
        category: "men-clothing",
        stock: 15,
        attributes: { size: "32", color: "Blue", material: "Denim" }
    },
    {
        title: "Casual Check Shirt",
        description: "A stylish checked shirt for everyday use.",
        images: ["https://placehold.co/600x600?text=Mens+Shirt"],
        price: 999,
        brand: "Allen Solly",
        category: "men-clothing",
        stock: 20,
        attributes: { size: "L", color: "Red", material: "Cotton" }
    },
    {
        title: "Hooded Sweatshirt",
        description: "A warm hoodie suitable for cool weather.",
        images: ["https://placehold.co/600x600?text=Mens+Hoodie"],
        price: 1499,
        brand: "Puma",
        category: "men-clothing",
        stock: 12,
        attributes: { size: "L", color: "Grey", material: "Fleece" }
    },
    {
        title: "Formal Trousers",
        description: "Comfortable formal trousers for office wear.",
        images: ["https://placehold.co/600x600?text=Mens+Trousers"],
        price: 1199,
        brand: "Van Heusen",
        category: "men-clothing",
        stock: 18,
        attributes: { size: "34", color: "Black", material: "Polyester Blend" }
    },

    // 2. WOMEN'S CLOTHING
    {
        title: "Floral Kurti",
        description: "A printed kurti suitable for casual occasions.",
        images: ["https://placehold.co/600x600?text=Floral+Kurti"],
        price: 799,
        brand: "Biba",
        category: "women-clothing",
        stock: 20,
        attributes: { size: "M", color: "Pink", material: "Rayon" }
    },
    {
        title: "High Waist Jeans",
        description: "High-waisted denim jeans with a comfortable fit.",
        images: ["https://placehold.co/600x600?text=Womens+Jeans"],
        price: 1399,
        brand: "Levis",
        category: "women-clothing",
        stock: 15,
        attributes: { size: "28", color: "Blue", material: "Denim" }
    },
    {
        title: "Casual Top",
        description: "A lightweight top for everyday styling.",
        images: ["https://placehold.co/600x600?text=Womens+Top"],
        price: 649,
        brand: "ONLY",
        category: "women-clothing",
        stock: 22,
        attributes: { size: "S", color: "White", material: "Cotton" }
    },
    {
        title: "Summer Dress",
        description: "A comfortable dress for summer outings.",
        images: ["https://placehold.co/600x600?text=Summer+Dress"],
        price: 1599,
        brand: "AND",
        category: "women-clothing",
        stock: 10,
        attributes: { size: "M", color: "Yellow", material: "Viscose" }
    },
    {
        title: "Women's Jacket",
        description: "A stylish jacket for cooler days.",
        images: ["https://placehold.co/600x600?text=Womens+Jacket"],
        price: 1899,
        brand: "ONLY",
        category: "women-clothing",
        stock: 8,
        attributes: { size: "L", color: "Brown", material: "Polyester" }
    },

    // 3. ELECTRONICS
    {
        title: "Wireless Headphones",
        description: "Wireless headphones designed for clear audio.",
        images: ["https://placehold.co/600x600?text=Headphones"],
        price: 2499,
        brand: "Sony",
        category: "electronics",
        stock: 10,
        attributes: { connectivity: "Bluetooth", batteryLife: "30 hours", color: "Black" }
    },
    {
        title: "Smart Watch",
        description: "A smartwatch for everyday activity tracking.",
        images: ["https://placehold.co/600x600?text=Smartwatch"],
        price: 2999,
        brand: "Noise",
        category: "electronics",
        stock: 14,
        attributes: { display: "AMOLED", batteryLife: "7 days", waterResistance: "IP68" }
    },
    {
        title: "Bluetooth Speaker",
        description: "A portable speaker with wireless connectivity.",
        images: ["https://placehold.co/600x600?text=Bluetooth+Speaker"],
        price: 1799,
        brand: "JBL",
        category: "electronics",
        stock: 16,
        attributes: { connectivity: "Bluetooth", batteryLife: "12 hours", color: "Blue" }
    },
    {
        title: "Wireless Mouse",
        description: "An ergonomic wireless mouse for work and study.",
        images: ["https://placehold.co/600x600?text=Wireless+Mouse"],
        price: 799,
        brand: "Logitech",
        category: "electronics",
        stock: 30,
        attributes: { connectivity: "Wireless", dpi: 1600, color: "Black" }
    },
    {
        title: "USB-C Charger",
        description: "A compact charger for compatible electronic devices.",
        images: ["https://placehold.co/600x600?text=USB-C+Charger"],
        price: 999,
        brand: "Anker",
        category: "electronics",
        stock: 20,
        attributes: { power: "30W", portType: "USB-C", color: "White" }
    },

    // 4. COSMETICS
    {
        title: "Matte Lipstick",
        description: "A smooth matte lipstick for everyday use.",
        images: ["https://placehold.co/600x600?text=Lipstick"],
        price: 499,
        brand: "Maybelline",
        category: "cosmetics",
        stock: 25,
        attributes: { shade: "Red", finish: "Matte", quantity: "3.9g" }
    },
    {
        title: "Face Moisturizer",
        description: "A daily moisturizer for skincare routines.",
        images: ["https://placehold.co/600x600?text=Moisturizer"],
        price: 349,
        brand: "Nivea",
        category: "cosmetics",
        stock: 20,
        attributes: { skinType: "Normal", quantity: "100ml", fragrance: "Mild" }
    },
    {
        title: "Volumizing Mascara",
        description: "Mascara designed to define and enhance eyelashes.",
        images: ["https://placehold.co/600x600?text=Mascara"],
        price: 599,
        brand: "Lakme",
        category: "cosmetics",
        stock: 18,
        attributes: { color: "Black", finish: "Volumizing", waterproof: true }
    },
    {
        title: "Compact Powder",
        description: "Compact powder for a smooth-looking finish.",
        images: ["https://placehold.co/600x600?text=Compact+Powder"],
        price: 399,
        brand: "Maybelline",
        category: "cosmetics",
        stock: 22,
        attributes: { shade: "Natural Beige", finish: "Matte", quantity: "8g" }
    },
    {
        title: "Nail Polish",
        description: "Quick-drying nail polish with a glossy finish.",
        images: ["https://placehold.co/600x600?text=Nail+Polish"],
        price: 199,
        brand: "Lakme",
        category: "cosmetics",
        stock: 30,
        attributes: { color: "Pink", finish: "Glossy", quantity: "9ml" }
    }
];
   

connectDb()
    .then(() => {
        return Product.insertMany(products);
    })
    .then((result) => {
        console.log(`${result.length} products inserted successfully`);
        return mongoose.connection.close();
    })
    .catch((error) => {
        console.log("Insertion failed:", error.message);
        return mongoose.connection.close();
    });