/* ==========================================
   KISAN CONNECT
   product-details.js
   STAGE 4.6.1
========================================== */


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


        if (
            document.body.classList.contains("dark")
        ) {

            localStorage.setItem(
                "theme",
                "dark"
            );

            themeBtn.textContent = "☀️";

        } else {

            localStorage.setItem(
                "theme",
                "light"
            );

            themeBtn.textContent = "🌙";

        }

    });

}


// ==========================================
// GET SELECTED PRODUCT ID
// ==========================================

const productId =
    Number(
        localStorage.getItem(
            "selectedProductId"
        )
    );


// ==========================================
// GET ALL LISTINGS
// ==========================================

const listings =
    JSON.parse(
        localStorage.getItem(
            "marketplaceListings"
        )
    ) || [];


// ==========================================
// FIND PRODUCT
// ==========================================

const product =
    listings.find(
        listing =>
            Number(listing.id) === productId
    );


// ==========================================
// ELEMENTS
// ==========================================

const productDetails =
    document.getElementById(
        "productDetails"
    );


const sellerInfo =
    document.getElementById(
        "sellerInfo"
    );


// ==========================================
// PRODUCT NOT FOUND
// ==========================================

if (!product) {

    if (productDetails) {

        productDetails.innerHTML = `

            <div class="empty-marketplace">

                <div class="empty-icon">
                    📦
                </div>

                <h2>
                    Product Not Found
                </h2>

                <p>
                    This listing may have been
                    removed by the seller.
                </p>

                <a
                    href="marketplace.html"
                    class="sell-btn">

                    ← Back to Marketplace

                </a>

            </div>

        `;

    }

}


// ==========================================
// DISPLAY PRODUCT
// ==========================================

if (
    product &&
    productDetails
) {

    // ======================================
    // PRODUCT IMAGES
    // ======================================

    let imagesHTML = "";


    if (
        product.images &&
        product.images.length > 0
    ) {

        imagesHTML = `

            <div class="product-gallery">

                ${product.images.map(
                    image => `

                        <img
                            src="${image}"
                            alt="${escapeHTML(
                                product.productName
                            )}"
                            class="detail-product-image"
                        >

                    `
                ).join("")}

            </div>

        `;

    } else {

        imagesHTML = `

            <div class="product-image-placeholder">

                📦

            </div>

        `;

    }


    // ======================================
    // PRODUCT INFORMATION
    // ======================================

    productDetails.innerHTML = `

        <div class="product-details-layout">

            <div class="product-details-images">

                ${imagesHTML}

            </div>


            <div class="product-details-info">

                <span class="product-category">

                    ${escapeHTML(
                        product.category
                    )}

                </span>


                <h1>

                    ${escapeHTML(
                        product.productName
                    )}

                </h1>


                <div class="product-detail-price">

                    ₹${Number(
                        product.price
                    ).toLocaleString("en-IN")}

                    <span>
                        / ${escapeHTML(
                            product.unit
                        )}
                    </span>

                </div>


                <div class="detail-status">

                    🟢
                    ${escapeHTML(
                        product.status ||
                        "Available"
                    )}

                </div>


                <hr>


                <h3>
                    Description
                </h3>


                <p class="full-description">

                    ${escapeHTML(
                        product.description
                    )}

                </p>


                <div class="product-detail-info-list">

                    <p>

                        📦
                        <strong>
                            Quantity:
                        </strong>

                        ${product.quantity}
                        ${escapeHTML(
                            product.unit
                        )}

                    </p>


                    <p>

                        📍
                        <strong>
                            Location:
                        </strong>

                        ${escapeHTML(
                            product.location
                        )}

                    </p>


                    <p>

                        📅
                        <strong>
                            Listed:
                        </strong>

                        ${formatDate(
                            product.createdAt
                        )}

                    </p>

                </div>


                <!-- ==================================
                     CART QUANTITY
                ================================== -->

                <div class="cart-quantity-section">

                    <label for="cartQuantity">

                        Quantity to Buy

                    </label>


                    <input
                        type="number"
                        id="cartQuantity"
                        min="1"
                        max="${Number(
                            product.quantity
                        )}"
                        value="1"
                    >


                    <small>

                        Maximum available:
                        ${Number(
                            product.quantity
                        )}
                        ${escapeHTML(
                            product.unit
                        )}

                    </small>

                </div>


                <div class="product-detail-actions">


                    <!-- ==================================
                         ADD TO CART
                    ================================== -->

                    <button
                        class="buy-placeholder-btn"
                        id="addToCartBtn"
                        type="button">

                        🛒 Add to Cart

                    </button>


                    <a
                        href="marketplace.html"
                        class="back-marketplace-btn">

                        ← Back to Marketplace

                    </a>

                </div>

            </div>

        </div>

    `;

}


// ==========================================
// DISPLAY SELLER INFORMATION
// ==========================================

if (
    product &&
    sellerInfo
) {

    // ======================================
    // SELLER EXISTS
    // ======================================

    if (product.seller) {

        const seller =
            product.seller;


        sellerInfo.innerHTML = `

            <div class="seller-profile">

                <div class="seller-avatar">

                    👤

                </div>


                <div class="seller-details">

                    <h2>

                        ${escapeHTML(
                            seller.name ||
                            "Unknown Seller"
                        )}

                    </h2>


                    <p>

                        🏷️
                        <strong>
                            Role:
                        </strong>

                        ${escapeHTML(
                            seller.role ||
                            "User"
                        )}

                    </p>


                    <p>

                        📧
                        <strong>
                            Email:
                        </strong>

                        ${escapeHTML(
                            seller.email ||
                            "Not provided"
                        )}

                    </p>


                    <p>

                        📞
                        <strong>
                            Phone:
                        </strong>

                        ${
                            seller.phone
                            ? escapeHTML(
                                seller.phone
                              )
                            : "Not provided"
                        }

                    </p>

                </div>

            </div>


            <div class="contact-buttons">

                ${
                    seller.phone
                    ? `

                        <a
                            href="tel:${encodeURIComponent(
                                seller.phone
                            )}"
                            class="contact-btn">

                            📞 Call Seller

                        </a>

                    `
                    : ""
                }


                ${
                    seller.email
                    ? `

                        <a
                            href="mailto:${encodeURIComponent(
                                seller.email
                            )}"
                            class="contact-btn">

                            📧 Email Seller

                        </a>

                    `
                    : ""
                }

            </div>

        `;

    }


    // ======================================
    // OLD LISTING WITHOUT SELLER DATA
    // ======================================

    else {

        sellerInfo.innerHTML = `

            <div class="seller-unavailable">

                <p>

                    ⚠️ Seller information
                    isn't available for this listing.

                </p>

                <p>

                    This may be an older listing
                    created before seller information
                    was added.

                </p>

            </div>

        `;

    }

}


// ==========================================
// ADD TO CART SYSTEM
// ==========================================

const addToCartBtn =
    document.getElementById(
        "addToCartBtn"
    );


const cartQuantityInput =
    document.getElementById(
        "cartQuantity"
    );


if (
    addToCartBtn &&
    cartQuantityInput &&
    product
) {

    addToCartBtn.addEventListener(
        "click",
        function () {

            // ==================================
            // GET REQUESTED QUANTITY
            // ==================================

            const requestedQuantity =
                Number(
                    cartQuantityInput.value
                );


            const availableQuantity =
                Number(
                    product.quantity
                );


            // ==================================
            // VALIDATE QUANTITY
            // ==================================

            if (
                !Number.isInteger(
                    requestedQuantity
                ) ||
                requestedQuantity <= 0
            ) {

                alert(
                    "⚠️ Please enter a valid quantity."
                );

                return;

            }


            if (
                requestedQuantity >
                availableQuantity
            ) {

                alert(
                    "⚠️ You cannot add more than the available quantity."
                );

                cartQuantityInput.value =
                    availableQuantity;

                return;

            }


            // ==================================
            // GET EXISTING CART
            // ==================================

            let cart =
                JSON.parse(
                    localStorage.getItem(
                        "cart"
                    )
                ) || [];


            // ==================================
            // CHECK IF PRODUCT ALREADY EXISTS
            // ==================================

            const existingItem =
                cart.find(
                    item =>
                        Number(item.productId) ===
                        Number(product.id)
                );


            if (existingItem) {

                const newQuantity =
                    Number(
                        existingItem.quantity
                    ) +
                    requestedQuantity;


                // Don't exceed available stock

                if (
                    newQuantity >
                    availableQuantity
                ) {

                    alert(
                        "⚠️ This product is already in your cart and the requested quantity would exceed the available stock."
                    );

                    return;

                }


                existingItem.quantity =
                    newQuantity;


            } else {

                // ==================================
                // CREATE CART ITEM
                // ==================================

                const cartItem = {

                    productId:
                        product.id,

                    productName:
                        product.productName,

                    category:
                        product.category,

                    description:
                        product.description,

                    price:
                        Number(
                            product.price
                        ),

                    unit:
                        product.unit,

                    quantity:
                        requestedQuantity,

                    availableQuantity:
                        availableQuantity,

                    location:
                        product.location,

                    images:
                        product.images || [],

                    seller:
                        product.seller || null,

                    addedAt:
                        new Date().toISOString()

                };


                cart.push(
                    cartItem
                );

            }


            // ==================================
            // SAVE CART
            // ==================================

            localStorage.setItem(
                "cart",
                JSON.stringify(
                    cart
                )
            );


            // ==================================
// SUCCESS
// ==================================

alert(
    "🛒 Product added to your cart!"
);


// ==================================
// GO TO CART
// ==================================

window.location.href =
    "cart.html";


// ==================================
// GO TO CART
// ==================================

window.location.href =
    "cart.html";

            // Reset quantity

            cartQuantityInput.value =
                1;

        }
    );

}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(dateString) {

    if (!dateString) {
        return "Unknown";
    }


    const date =
        new Date(dateString);


    if (isNaN(date.getTime())) {
        return "Unknown";
    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


// ==========================================
// SECURITY
// ==========================================

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


console.log(
    "🛒 Product Details + Cart System Loaded Successfully!"
);