/* ==========================================
   KISAN CONNECT
   cart.js
   STAGE 4.6.2
========================================== */

console.log("🛒 Kisan Connect Cart System Loaded.");


// ==========================================
// DARK MODE
// ==========================================

const themeBtn =
    document.getElementById("themeBtn");


if (
    localStorage.getItem("theme") === "dark"
) {

    document.body.classList.add("dark");

    if (themeBtn) {
        themeBtn.textContent = "☀️";
    }

}


if (themeBtn) {

    themeBtn.addEventListener(
        "click",
        function () {

            document.body.classList.toggle("dark");


            if (
                document.body.classList.contains("dark")
            ) {

                localStorage.setItem(
                    "theme",
                    "dark"
                );

                themeBtn.textContent = "☀️";

            }

            else {

                localStorage.setItem(
                    "theme",
                    "light"
                );

                themeBtn.textContent = "🌙";

            }

        }
    );

}


// ==========================================
// ELEMENTS
// ==========================================

const cartItemsContainer =
    document.getElementById("cartItems");


const cartItemCount =
    document.getElementById("cartItemCount");


const summaryItemCount =
    document.getElementById("summaryItemCount");


const cartSubtotal =
    document.getElementById("cartSubtotal");


const deliveryCharge =
    document.getElementById("deliveryCharge");


const cartTotal =
    document.getElementById("cartTotal");


const checkoutBtn =
    document.getElementById("checkoutBtn");


// ==========================================
// LOAD CART
// ==========================================

let cart =
    JSON.parse(
        localStorage.getItem("cart")
    ) || [];


// ==========================================
// DISPLAY CART
// ==========================================

function displayCart() {

    if (!cartItemsContainer) {
        return;
    }


    cartItemsContainer.innerHTML = "";


    // ======================================
    // EMPTY CART
    // ======================================

    if (cart.length === 0) {

        cartItemsContainer.innerHTML = `

            <div class="empty-cart">

                <div class="empty-cart-icon">
                    🛒
                </div>

                <h2>
                    Your Cart Is Empty
                </h2>

                <p>
                    You haven't added any
                    products to your cart yet.
                </p>

                <a
                    href="marketplace.html"
                    class="shop-btn"
                >
                    Browse Marketplace
                </a>

            </div>

        `;


        updateCartSummary();

        return;

    }


    // ======================================
    // CREATE CART ITEMS
    // ======================================

    cart.forEach(
        function (item) {

            const cartItem =
                document.createElement("article");


            cartItem.className =
                "cart-item";


            // ==================================
            // IMAGE
            // ==================================

            let imageHTML = `

                <div class="cart-item-image-placeholder">
                    📦
                </div>

            `;


            if (
                item.images &&
                item.images.length > 0
            ) {

                imageHTML = `

                    <img
                        src="${escapeHTML(
                            item.images[0]
                        )}"
                        alt="${escapeHTML(
                            item.productName ||
                            "Product"
                        )}"
                        class="cart-item-image"
                    >

                `;

            }


            // ==================================
            // QUANTITY
            // ==================================

            const cartQuantity =
                Number(item.quantity) || 1;


            // ==================================
            // ITEM TOTAL
            // ==================================

            const itemTotal =
                Number(item.price || 0) *
                cartQuantity;


            // ==================================
            // CARD
            // ==================================

            cartItem.innerHTML = `

                ${imageHTML}


                <div class="cart-item-info">

                    <span class="cart-item-category">

                        ${escapeHTML(
                            item.category ||
                            "Product"
                        )}

                    </span>


                    <h3>

                        ${escapeHTML(
                            item.productName ||
                            "Unnamed Product"
                        )}

                    </h3>


                    <p class="cart-item-location">

                        📍
                        ${escapeHTML(
                            item.location ||
                            "Location unavailable"
                        )}

                    </p>


                    <p class="cart-item-price">

                        ₹${Number(
                            item.price || 0
                        ).toLocaleString("en-IN")}

                        <span>

                            /
                            ${escapeHTML(
                                item.unit ||
                                "unit"
                            )}

                        </span>

                    </p>


                    <!-- ==================================
                         QUANTITY CONTROLS
                    =================================== -->

                    <div class="cart-quantity-controls">

                        <button
                            type="button"
                            class="quantity-btn decrease-btn"
                            data-id="${item.productId}"
                        >
                            −
                        </button>


                        <span class="cart-quantity">

                            ${cartQuantity}

                        </span>


                        <button
                            type="button"
                            class="quantity-btn increase-btn"
                            data-id="${item.productId}"
                        >
                            +
                        </button>

                    </div>


                    <!-- ==================================
                         REMOVE BUTTON
                    =================================== -->

                    <button
                        type="button"
                        class="remove-cart-item-btn"
                        data-id="${item.productId}"
                    >

                        🗑️ Remove

                    </button>

                </div>


                <!-- ==================================
                     ITEM TOTAL
                =================================== -->

                <div class="cart-item-total">

                    ₹${itemTotal.toLocaleString("en-IN")}

                </div>

            `;


            cartItemsContainer.appendChild(
                cartItem
            );

        }
    );


    attachCartEvents();

    updateCartSummary();

}


// ==========================================
// ATTACH CART EVENTS
// ==========================================

function attachCartEvents() {


    // ======================================
    // INCREASE QUANTITY
    // ======================================

    const increaseButtons =
        document.querySelectorAll(
            ".increase-btn"
        );


    increaseButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const productId =
                        Number(
                            button.dataset.id
                        );


                    const item =
                        cart.find(
                            function (product) {

                                return Number(
                                    product.productId
                                ) === productId;

                            }
                        );


                    if (!item) {
                        return;
                    }


                    const availableQuantity =
                        Number(
                            item.availableQuantity
                        ) || 0;


                    const currentQuantity =
                        Number(
                            item.quantity
                        ) || 1;


                    // ==================================
                    // STOCK LIMIT
                    // ==================================

                    if (
                        availableQuantity > 0 &&
                        currentQuantity >=
                            availableQuantity
                    ) {

                        alert(
                            "⚠️ You cannot add more than the available quantity."
                        );

                        return;

                    }


                    item.quantity =
                        currentQuantity + 1;


                    saveCart();

                }
            );

        }
    );


    // ======================================
    // DECREASE QUANTITY
    // ======================================

    const decreaseButtons =
        document.querySelectorAll(
            ".decrease-btn"
        );


    decreaseButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const productId =
                        Number(
                            button.dataset.id
                        );


                    const item =
                        cart.find(
                            function (product) {

                                return Number(
                                    product.productId
                                ) === productId;

                            }
                        );


                    if (!item) {
                        return;
                    }


                    const currentQuantity =
                        Number(
                            item.quantity
                        ) || 1;


                    // ==================================
                    // REMOVE WHEN ZERO
                    // ==================================

                    if (
                        currentQuantity <= 1
                    ) {

                        removeCartItem(
                            productId
                        );

                        return;

                    }


                    item.quantity =
                        currentQuantity - 1;


                    saveCart();

                }
            );

        }
    );


    // ======================================
    // REMOVE ITEM
    // ======================================

    const removeButtons =
        document.querySelectorAll(
            ".remove-cart-item-btn"
        );


    removeButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const productId =
                        Number(
                            button.dataset.id
                        );


                    removeCartItem(
                        productId
                    );

                }
            );

        }
    );

}


// ==========================================
// REMOVE CART ITEM
// ==========================================

function removeCartItem(productId) {

    const item =
        cart.find(
            function (product) {

                return Number(
                    product.productId
                ) === productId;

            }
        );


    if (!item) {
        return;
    }


    const confirmed =
        confirm(
            `Remove "${item.productName}" from your cart?`
        );


    if (!confirmed) {
        return;
    }


    cart =
        cart.filter(
            function (product) {

                return Number(
                    product.productId
                ) !== productId;

            }
        );


    saveCart();

}


// ==========================================
// SAVE CART
// ==========================================

function saveCart() {

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );


    displayCart();

}


// ==========================================
// UPDATE CART SUMMARY
// ==========================================

function updateCartSummary() {

    let totalItems = 0;

    let subtotal = 0;


    cart.forEach(
        function (item) {

            const quantity =
                Number(
                    item.quantity
                ) || 0;


            const price =
                Number(
                    item.price
                ) || 0;


            totalItems +=
                quantity;


            subtotal +=
                price * quantity;

        }
    );


    // ======================================
    // ITEM COUNT
    // ======================================

    if (cartItemCount) {

        cartItemCount.textContent =
            `${totalItems} ${
                totalItems === 1
                    ? "item"
                    : "items"
            }`;

    }


    if (summaryItemCount) {

        summaryItemCount.textContent =
            totalItems;

    }


    // ======================================
    // SUBTOTAL
    // ======================================

    if (cartSubtotal) {

        cartSubtotal.textContent =
            `₹${subtotal.toLocaleString("en-IN")}`;

    }


    // ======================================
    // DELIVERY
    // ======================================

    if (deliveryCharge) {

        deliveryCharge.textContent =
            "Calculated at checkout";

    }


    // ======================================
    // TOTAL
    // ======================================

    if (cartTotal) {

        cartTotal.textContent =
            `₹${subtotal.toLocaleString("en-IN")}`;

    }

}


// ==========================================
// CHECKOUT BUTTON
// ==========================================

if (checkoutBtn) {

    checkoutBtn.addEventListener(
        "click",
        function () {

            if (cart.length === 0) {

                alert(
                    "🛒 Your cart is empty."
                );

                return;

            }


            // ==================================
            // GO TO CHECKOUT
            // ==================================

            window.location.href =
                "checkout.html";

        }
    );

}


// ==========================================
// SECURITY
// ==========================================

function escapeHTML(value) {

    return String(
        value ?? ""
    )

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


// ==========================================
// INITIAL LOAD
// ==========================================

displayCart();


console.log(
    `🛒 ${cart.length} cart item(s) loaded.`
);