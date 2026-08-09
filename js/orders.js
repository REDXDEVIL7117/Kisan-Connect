/* ==========================================
   KISAN CONNECT
   orders.js
   STAGE 4.7.2.1
   BUYER ORDER CANCELLATION
========================================== */

console.log("📋 Orders page loaded.");


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
        "⚠️ Please log in to view your orders."
    );

    window.location.href =
        "login.html";

}


// ==========================================
// GET ORDERS
// ==========================================

let allOrders =
    JSON.parse(
        localStorage.getItem("orders")
    ) || [];


// ==========================================
// ELEMENTS
// ==========================================

const ordersContainer =
    document.getElementById(
        "ordersContainer"
    );


// ==========================================
// GET USER ORDERS
// ==========================================
//
// Only show orders belonging to the
// currently logged-in user.
// ==========================================

function getUserOrders() {

    if (!currentUser) {

        return [];

    }


    return allOrders
        .filter(order => {

            // Match by user ID when available

            if (
                currentUser.id &&
                order.userId
            ) {

                return (
                    String(order.userId) ===
                    String(currentUser.id)
                );

            }


            // Fallback for older orders
            // that may not contain userId

            if (
                order.buyer &&
                order.buyer.email &&
                currentUser.email
            ) {

                return (
                    order.buyer.email.toLowerCase() ===
                    currentUser.email.toLowerCase()
                );

            }


            return false;

        })
        .reverse();

}


// ==========================================
// CANCEL ORDER
// ==========================================

function cancelOrder(orderId) {

    // ======================================
    // FIND ORDER
    // ======================================

    const orderIndex =
        allOrders.findIndex(
            order =>
                String(order.id) ===
                String(orderId)
        );


    if (orderIndex === -1) {

        alert(
            "⚠️ Order could not be found."
        );

        return;

    }


    const order =
        allOrders[orderIndex];


    // ======================================
    // SECURITY CHECK
    // ======================================
    //
    // Make sure the selected order actually
    // belongs to the currently logged-in user.
    // ======================================

    let belongsToUser = false;


    if (
        currentUser &&
        currentUser.id &&
        order.userId
    ) {

        belongsToUser =
            String(order.userId) ===
            String(currentUser.id);

    }


    // Fallback for older orders

    if (
        !belongsToUser &&
        order.buyer &&
        order.buyer.email &&
        currentUser &&
        currentUser.email
    ) {

        belongsToUser =
            order.buyer.email.toLowerCase() ===
            currentUser.email.toLowerCase();

    }


    if (!belongsToUser) {

        alert(
            "⚠️ You cannot cancel this order."
        );

        return;

    }


    // ======================================
    // CHECK CURRENT STATUS
    // ======================================

    const currentStatus =
        String(
            order.status ||
            "Placed"
        ).toLowerCase();


    if (
        currentStatus ===
        "cancelled"
    ) {

        alert(
            "ℹ️ This order has already been cancelled."
        );

        return;

    }


    if (
        currentStatus !==
        "placed"
    ) {

        alert(
            "⚠️ This order cannot be cancelled."
        );

        return;

    }


    // ======================================
    // CONFIRMATION
    // ======================================

    const confirmed =
        confirm(

            "⚠️ Cancel Order?\n\n" +

            "Are you sure you want to cancel " +
            "order " +
            order.id +
            "?\n\n" +

            "This action cannot be undone."

        );


    if (!confirmed) {

        return;

    }


    // ======================================
    // UPDATE ORDER
    // ======================================

    order.status =
        "Cancelled";


    order.updatedAt =
        new Date().toISOString();


    // ======================================
    // SAVE ORDERS
    // ======================================

    localStorage.setItem(
        "orders",
        JSON.stringify(
            allOrders
        )
    );


    // ======================================
    // SUCCESS MESSAGE
    // ======================================

    alert(
        "✅ Order " +
        order.id +
        " has been cancelled."
    );


    // ======================================
    // REFRESH PAGE CONTENT
    // ======================================

    displayOrders();

}


// ==========================================
// DISPLAY ORDERS
// ==========================================

function displayOrders() {

    if (!ordersContainer) {

        console.error(
            "❌ ordersContainer not found."
        );

        return;

    }


    const userOrders =
        getUserOrders();


    ordersContainer.innerHTML =
        "";


    // ======================================
    // EMPTY ORDERS
    // ======================================

    if (
        userOrders.length ===
        0
    ) {

        ordersContainer.innerHTML = `

            <div class="empty-orders">

                <div class="empty-orders-icon">
                    📦
                </div>

                <h2>
                    No Orders Yet
                </h2>

                <p>
                    You haven't placed any orders yet.
                </p>

                <a
                    href="marketplace.html"
                    class="shop-btn"
                >

                    🛒 Start Shopping

                </a>

            </div>

        `;

        return;

    }


    // ======================================
    // CREATE ORDER CARDS
    // ======================================

    userOrders.forEach(
        order => {

            const items =
                Array.isArray(
                    order.items
                )
                    ? order.items
                    : [];


            // ==================================
            // ITEM COUNT
            // ==================================

            const itemCount =
                items.reduce(
                    (
                        total,
                        item
                    ) => {

                        return (
                            total +
                            (
                                Number(
                                    item.quantity
                                ) || 1
                            )
                        );

                    },
                    0
                );


            // ==================================
            // PRODUCT PREVIEW
            // ==================================

            const productPreview =
                items
                    .slice(
                        0,
                        5
                    )
                    .map(
                        item => {

                            const name =
                                item.productName ||
                                "Unnamed Product";


                            const quantity =
                                Number(
                                    item.quantity
                                ) || 1;


                            const price =
                                Number(
                                    item.price
                                ) || 0;


                            return `

                                <div
                                    class="order-product"
                                >

                                    <span
                                        class="order-product-name"
                                    >

                                        ${escapeHTML(
                                            name
                                        )}

                                    </span>


                                    <span
                                        class="order-product-quantity"
                                    >

                                        × ${quantity}

                                    </span>


                                    <span
                                        class="order-product-price"
                                    >

                                        ${formatCurrency(
                                            price *
                                            quantity
                                        )}

                                    </span>

                                </div>

                            `;

                        }
                    )
                    .join("");


            // ==================================
            // MORE PRODUCTS
            // ==================================

            const moreProducts =
                items.length > 5
                    ? `

                        <div
                            class="order-product"
                        >

                            <span
                                class="order-product-name"
                            >

                                +
                                ${items.length - 5}
                                more product(s)

                            </span>

                        </div>

                    `
                    : "";


            // ==================================
            // ORDER STATUS
            // ==================================

            const orderStatus =
                order.status ||
                "Placed";


            const normalizedStatus =
                String(
                    orderStatus
                ).toLowerCase();


            // ==================================
            // CANCEL BUTTON
            // ==================================
            //
            // Only show cancellation when the
            // order is currently Placed.
            // ==================================

            let cancelButtonHTML =
                "";


            if (
                normalizedStatus ===
                "placed"
            ) {

                cancelButtonHTML = `

                    <button
                        type="button"
                        class="cancel-order-btn"
                        data-order-id="${escapeHTML(
                            order.id
                        )}"
                    >

                        🛑 Cancel Order

                    </button>

                `;

            }


            // ==================================
            // ORDER CARD
            // ==================================

            const orderCard =
                document.createElement(
                    "article"
                );


            orderCard.className =
                "order-card";


            orderCard.innerHTML = `

                <!-- ORDER HEADER -->

                <div
                    class="order-card-header"
                >

                    <div>

                        <h2
                            class="order-id"
                        >

                            ${escapeHTML(
                                order.id ||
                                "Unknown Order"
                            )}

                        </h2>


                        <p
                            class="order-date"
                        >

                            ${formatDate(
                                order.createdAt
                            )}

                        </p>

                    </div>


                    <span
                        class="order-status"
                    >

                        ${escapeHTML(
                            orderStatus
                        )}

                    </span>

                </div>



                <!-- ORDER INFORMATION -->

                <div
                    class="order-info-grid"
                >


                    <div
                        class="order-info-box"
                    >

                        <span>
                            Items
                        </span>

                        <strong>

                            ${itemCount}

                        </strong>

                    </div>


                    <div
                        class="order-info-box"
                    >

                        <span>
                            Payment
                        </span>

                        <strong>

                            ${escapeHTML(
                                order.paymentMethod ||
                                "Not provided"
                            )}

                        </strong>

                    </div>


                    <div
                        class="order-info-box"
                    >

                        <span>
                            Total
                        </span>

                        <strong>

                            ${formatCurrency(
                                order.total
                            )}

                        </strong>

                    </div>


                </div>



                <!-- PRODUCTS -->

                <div
                    class="order-products"
                >

                    ${productPreview}

                    ${moreProducts}

                </div>



                <!-- FOOTER -->

                <div
                    class="order-card-footer"
                >

                    <div>

                        <span
                            class="order-total-label"
                        >

                            Order Total

                        </span>


                        <strong
                            class="order-total"
                        >

                            ${formatCurrency(
                                order.total
                            )}

                        </strong>

                    </div>


                    <!-- ORDER ACTIONS -->

                    <div
                        class="order-actions"
                    >

                        <!-- VIEW DETAILS -->

                        <a
                            href="order-details.html?id=${encodeURIComponent(
                                order.id
                            )}"
                            class="view-order-btn"
                        >

                            👁️ View Details

                        </a>


                        <!-- CANCEL ORDER -->

                        ${cancelButtonHTML}

                    </div>

                </div>

            `;


            // ==================================
            // CANCEL BUTTON EVENT
            // ==================================

            const cancelButton =
                orderCard.querySelector(
                    ".cancel-order-btn"
                );


            if (cancelButton) {

                cancelButton.addEventListener(
                    "click",
                    () => {

                        cancelOrder(
                            cancelButton.dataset.orderId
                        );

                    }
                );

            }


            // ==================================
            // ADD CARD
            // ==================================

            ordersContainer.appendChild(
                orderCard
            );

        }
    );

}


// ==========================================
// FORMAT CURRENCY
// ==========================================

function formatCurrency(
    value
) {

    const amount =
        Number(value) || 0;


    return `₹${amount.toLocaleString(
        "en-IN"
    )}`;

}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(
    dateString
) {

    if (!dateString) {

        return "Date unavailable";

    }


    const date =
        new Date(
            dateString
        );


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

            day:
                "numeric",

            month:
                "short",

            year:
                "numeric",

            hour:
                "numeric",

            minute:
                "2-digit"

        }
    );

}


// ==========================================
// SECURITY
// ==========================================

function escapeHTML(
    value
) {

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

displayOrders();


console.log(
    "✅ Orders system loaded successfully."
);