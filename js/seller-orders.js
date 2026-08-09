/* ==========================================
   KISAN CONNECT
   seller-orders.js
   STAGE 4.7.2.1
========================================== */

console.log("📦 Seller Orders page loaded.");


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

    alert(
        "⚠️ Please log in to view seller orders."
    );

    window.location.href =
        "login.html";

}


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

        themeBtn.textContent =
            "☀️";

    }

}


if (themeBtn) {

    themeBtn.addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "dark"
            );


            if (
                document.body.classList.contains(
                    "dark"
                )
            ) {

                localStorage.setItem(
                    "theme",
                    "dark"
                );

                themeBtn.textContent =
                    "☀️";

            } else {

                localStorage.setItem(
                    "theme",
                    "light"
                );

                themeBtn.textContent =
                    "🌙";

            }

        }
    );

}


// ==========================================
// GET ORDERS
// ==========================================

const allOrders =
    JSON.parse(
        localStorage.getItem("orders")
    ) || [];


// ==========================================
// ELEMENTS
// ==========================================

const sellerOrdersContainer =
    document.getElementById(
        "sellerOrdersContainer"
    );


const emptySellerOrders =
    document.getElementById(
        "emptySellerOrders"
    );


const totalOrdersElement =
    document.getElementById(
        "totalOrders"
    );


const totalProductsElement =
    document.getElementById(
        "totalProducts"
    );


const salesTotalElement =
    document.getElementById(
        "salesTotal"
    );


const sellerOrderCount =
    document.getElementById(
        "sellerOrderCount"
    );


// ==========================================
// GET SELLER IDENTIFIERS
// ==========================================
//
// Seller information can exist as:
//
// seller.id
// seller.email
//
// We use both so older listings remain
// compatible.
// ==========================================

function getSellerId() {

    if (!currentUser) {
        return null;
    }

    return currentUser.id
        ? String(currentUser.id)
        : null;

}


function getSellerEmail() {

    if (
        !currentUser ||
        !currentUser.email
    ) {

        return null;

    }

    return String(
        currentUser.email
    ).trim().toLowerCase();

}


// ==========================================
// CHECK IF PRODUCT BELONGS TO SELLER
// ==========================================

function isSellerProduct(item) {

    if (!item || !item.seller) {

        return false;

    }


    const seller =
        item.seller;


    const currentSellerId =
        getSellerId();


    const currentSellerEmail =
        getSellerEmail();


    // ======================================
    // MATCH BY SELLER ID
    // ======================================

    if (
        currentSellerId &&
        seller.id
    ) {

        if (
            String(seller.id) ===
            currentSellerId
        ) {

            return true;

        }

    }


    // ======================================
    // FALLBACK: MATCH BY EMAIL
    // ======================================

    if (
        currentSellerEmail &&
        seller.email
    ) {

        if (
            String(seller.email)
                .trim()
                .toLowerCase() ===
            currentSellerEmail
        ) {

            return true;

        }

    }


    return false;

}


// ==========================================
// GET SELLER PRODUCTS FROM ORDERS
// ==========================================
//
// Instead of showing the entire order,
// we extract only the products sold by
// the currently logged-in seller.
// ==========================================

function getSellerOrders() {

    const sellerOrders = [];


    allOrders.forEach(order => {

        const items =
            Array.isArray(order.items)
                ? order.items
                : [];


        const sellerItems =
            items.filter(
                item =>
                    isSellerProduct(item)
            );


        if (
            sellerItems.length === 0
        ) {

            return;

        }


        sellerOrders.push({

            order:
                order,

            items:
                sellerItems

        });

    });


    // Newest orders first

    return sellerOrders.reverse();

}


// ==========================================
// DISPLAY ORDERS
// ==========================================

function displaySellerOrders() {

    if (!sellerOrdersContainer) {

        console.error(
            "❌ sellerOrdersContainer not found."
        );

        return;

    }


    const sellerOrders =
        getSellerOrders();


    sellerOrdersContainer.innerHTML =
        "";


    // ======================================
    // EMPTY STATE
    // ======================================

    if (
        sellerOrders.length === 0
    ) {

        sellerOrdersContainer.innerHTML =
            "";

        if (emptySellerOrders) {

            emptySellerOrders.hidden =
                false;

        }

        updateStatistics([]);

        return;

    }


    if (emptySellerOrders) {

        emptySellerOrders.hidden =
            true;

    }


    // ======================================
    // CREATE ORDER CARDS
    // ======================================

    sellerOrders.forEach(
        sellerOrder => {

            const order =
                sellerOrder.order;


            const items =
                sellerOrder.items;


            const sellerSubtotal =
                calculateSellerSubtotal(
                    items
                );


            const orderCard =
                document.createElement(
                    "article"
                );


            orderCard.className =
                "seller-order-card";


            const buyer =
                order.buyer || {};


            const status =
                order.status ||
                "Placed";


            const productHTML =
                items
                    .map(item => {

                        const quantity =
                            Number(
                                item.quantity
                            ) || 1;


                        const price =
                            Number(
                                item.price
                            ) || 0;


                        const itemTotal =
                            price *
                            quantity;


                        return `

                            <div class="seller-product">

                                <div
                                    class="seller-product-info"
                                >

                                    <p
                                        class="seller-product-name"
                                    >

                                        ${escapeHTML(
                                            item.productName ||
                                            "Unnamed Product"
                                        )}

                                    </p>


                                    <span
                                        class="seller-product-quantity"
                                    >

                                        Quantity:
                                        ${quantity}
                                        ×
                                        ${formatCurrency(
                                            price
                                        )}

                                    </span>

                                </div>


                                <strong
                                    class="seller-product-total"
                                >

                                    ${formatCurrency(
                                        itemTotal
                                    )}

                                </strong>

                            </div>

                        `;

                    })
                    .join("");


            orderCard.innerHTML = `

                <!-- ==================================
                     ORDER HEADER
                =================================== -->

                <div class="seller-order-header">

                    <div>

                        <h3
                            class="seller-order-id"
                        >

                            ${escapeHTML(
                                order.id ||
                                "Unknown Order"
                            )}

                        </h3>


                        <p
                            class="seller-order-date"
                        >

                            ${formatDate(
                                order.createdAt
                            )}

                        </p>

                    </div>


                    <span
                        class="seller-order-status"
                    >

                        ${escapeHTML(
                            status
                        )}

                    </span>

                </div>



                <!-- ==================================
                     BUYER INFORMATION
                =================================== -->

                <div class="seller-order-buyer">


                    <div
                        class="buyer-info-box"
                    >

                        <span>
                            Buyer
                        </span>

                        <strong>

                            ${escapeHTML(
                                buyer.name ||
                                "Not provided"
                            )}

                        </strong>

                    </div>


                    <div
                        class="buyer-info-box"
                    >

                        <span>
                            Phone
                        </span>

                        <strong>

                            ${escapeHTML(
                                buyer.phone ||
                                "Not provided"
                            )}

                        </strong>

                    </div>


                    <div
                        class="buyer-info-box"
                    >

                        <span>
                            Email
                        </span>

                        <strong>

                            ${escapeHTML(
                                buyer.email ||
                                "Not provided"
                            )}

                        </strong>

                    </div>

                </div>



                <!-- ==================================
                     PRODUCTS
                =================================== -->

                <div
                    class="seller-order-products"
                >

                    <h3>
                        Your Products
                    </h3>


                    ${productHTML}

                </div>



                <!-- ==================================
                     ORDER FOOTER
                =================================== -->

                <div
                    class="seller-order-footer"
                >

                    <div>

                        <span
                            class="seller-order-total-label"
                        >

                            Your Sales Total

                        </span>


                        <strong
                            class="seller-order-total"
                        >

                            ${formatCurrency(
                                sellerSubtotal
                            )}

                        </strong>

                    </div>

                </div>

            `;


            sellerOrdersContainer.appendChild(
                orderCard
            );

        }
    );


    updateStatistics(
        sellerOrders
    );

}


// ==========================================
// CALCULATE SELLER SUBTOTAL
// ==========================================

function calculateSellerSubtotal(
    items
) {

    return items.reduce(
        (total, item) => {

            const price =
                Number(
                    item.price
                ) || 0;


            const quantity =
                Number(
                    item.quantity
                ) || 1;


            return total +
                (
                    price *
                    quantity
                );

        },
        0
    );

}


// ==========================================
// UPDATE STATISTICS
// ==========================================

function updateStatistics(
    sellerOrders
) {

    let productCount = 0;

    let salesTotal = 0;


    sellerOrders.forEach(
        sellerOrder => {

            const items =
                sellerOrder.items;


            items.forEach(
                item => {

                    const quantity =
                        Number(
                            item.quantity
                        ) || 1;


                    const price =
                        Number(
                            item.price
                        ) || 0;


                    productCount +=
                        quantity;


                    salesTotal +=
                        price *
                        quantity;

                }
            );

        }
    );


    // ======================================
    // TOTAL ORDERS
    // ======================================

    if (totalOrdersElement) {

        totalOrdersElement.textContent =
            sellerOrders.length;

    }


    // ======================================
    // TOTAL PRODUCTS
    // ======================================

    if (totalProductsElement) {

        totalProductsElement.textContent =
            productCount;

    }


    // ======================================
    // SALES TOTAL
    // ======================================

    if (salesTotalElement) {

        salesTotalElement.textContent =
            formatCurrency(
                salesTotal
            );

    }


    // ======================================
    // ORDER COUNT
    // ======================================

    if (sellerOrderCount) {

        sellerOrderCount.textContent =
            `${sellerOrders.length} ${
                sellerOrders.length === 1
                    ? "order"
                    : "orders"
            }`;

    }

}


// ==========================================
// FORMAT CURRENCY
// ==========================================

function formatCurrency(value) {

    const amount =
        Number(value) || 0;


    return `₹${amount.toLocaleString(
        "en-IN"
    )}`;

}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(value) {

    if (!value) {

        return "Date unavailable";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Date unavailable";

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
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
// INITIALIZE
// ==========================================

displaySellerOrders();


console.log(
    "✅ Seller Orders system loaded successfully."
);