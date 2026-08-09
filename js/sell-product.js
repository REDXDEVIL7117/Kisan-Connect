/* ==========================================
   KISAN CONNECT
   SELL PRODUCT
   STAGE 4.5.4
========================================== */

console.log("🛒 Sell Product page loaded.");


// ==========================================
// GET CURRENT USER
// ==========================================

const currentUser =
    JSON.parse(
        localStorage.getItem("currentUser")
    );


// ==========================================
// LOGIN CHECK
// ==========================================

if (!currentUser) {

    alert("Please login before selling a product.");

    window.location.href = "login.html";

}


// ==========================================
// DARK MODE
// ==========================================

const themeBtn =
    document.getElementById("themeBtn");


if (localStorage.getItem("theme") === "dark") {

    document.body.classList.add("dark");

    if (themeBtn) {
        themeBtn.textContent = "☀️";
    }

}


if (themeBtn) {

    themeBtn.addEventListener("click", () => {

        document.body.classList.toggle("dark");

        if (document.body.classList.contains("dark")) {

            localStorage.setItem("theme", "dark");

            themeBtn.textContent = "☀️";

        } else {

            localStorage.setItem("theme", "light");

            themeBtn.textContent = "🌙";

        }

    });

}


// ==========================================
// IMAGE PREVIEW
// ==========================================

const imageInput =
    document.getElementById("productImages");

const imagePreview =
    document.getElementById("imagePreview");


let selectedImages = [];


if (imageInput) {

    imageInput.addEventListener("change", () => {

        selectedImages =
            Array.from(imageInput.files);

        imagePreview.innerHTML = "";


        selectedImages.forEach(file => {

            if (!file.type.startsWith("image/")) {
                return;
            }


            const reader =
                new FileReader();


            reader.onload = function (event) {

                const item =
                    document.createElement("div");

                item.className =
                    "image-preview-item";


                item.innerHTML = `

                    <img
                        src="${event.target.result}"
                        alt="Product preview"
                    >

                `;


                imagePreview.appendChild(item);

            };


            reader.readAsDataURL(file);

        });

    });

}


// ==========================================
// SELL FORM
// ==========================================

const sellForm =
    document.getElementById("sellForm");


if (sellForm) {

    sellForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            // ==================================
            // GET FORM VALUES
            // ==================================

            const productName =
                document
                    .getElementById("productName")
                    .value
                    .trim();


            const category =
                document
                    .getElementById("category")
                    .value;


            const description =
                document
                    .getElementById("description")
                    .value
                    .trim();


            const price =
                document
                    .getElementById("price")
                    .value;


            const unit =
                document
                    .getElementById("unit")
                    .value;


            const quantity =
                document
                    .getElementById("quantity")
                    .value;


            const location =
                document
                    .getElementById("location")
                    .value
                    .trim();


            // ==================================
            // VALIDATION
            // ==================================

            if (
                !productName ||
                !category ||
                !description ||
                !price ||
                !unit ||
                !quantity ||
                !location
            ) {

                alert(
                    "⚠️ Please fill in all required fields."
                );

                return;

            }


            // ==================================
            // GET EXISTING LISTINGS
            // ==================================

            let listings =
                JSON.parse(
                    localStorage.getItem(
                        "marketplaceListings"
                    )
                ) || [];


            // ==================================
            // CONVERT IMAGES TO DATA
            // ==================================

            const imagePromises =
                selectedImages.map(file => {

                    return new Promise(resolve => {

                        const reader =
                            new FileReader();


                        reader.onload = () => {

                            resolve(
                                reader.result
                            );

                        };


                        reader.onerror = () => {

                            resolve(null);

                        };


                        reader.readAsDataURL(file);

                    });

                });


            Promise.all(imagePromises)
                .then(images => {


                    // Remove failed images

                    const validImages =
                        images.filter(
                            image =>
                                image !== null
                        );


                    // ==================================
                    // CREATE LISTING
                    // ==================================

                    const listing = {

    // ==================================
    // BASIC PRODUCT INFORMATION
    // ==================================

    id: Date.now(),

    productName: productName,

    category: category,

    description: description,

    price: Number(price),

    unit: unit,

    quantity: Number(quantity),

    location: location,

    images: validImages,


    // ==================================
    // OWNER INFORMATION
    // ==================================

    ownerId: currentUser.id,

    ownerName: currentUser.name,

    ownerEmail: currentUser.email,


    // ==================================
    // SELLER INFORMATION
    // ==================================

    seller: {

        id: currentUser.id,

        name: currentUser.name,

        email: currentUser.email,

        phone: currentUser.phone,

        role: currentUser.role

    },


    // ==================================
    // STATUS
    // ==================================

    status: "Available",


    // ==================================
    // DATES
    // ==================================

    createdAt: new Date().toISOString(),

    updatedAt: new Date().toISOString()

};
                    // ==================================
                    // SAVE LISTING
                    // ==================================

                    listings.push(listing);


                    localStorage.setItem(
                        "marketplaceListings",
                        JSON.stringify(
                            listings
                        )
                    );


                    // ==================================
                    // SUCCESS
                    // ==================================

                    alert(
                        "✅ Your listing has been published!"
                    );


                    // ==================================
                    // GO TO MARKETPLACE
                    // ==================================

                    window.location.href =
                        "marketplace.html";

                });

        }
    );

}