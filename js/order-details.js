/* ==========================================
   KISAN CONNECT
   order-details.js
   STAGE 4.7.2.1
========================================== */

console.log("📦 Order Details page loaded.");


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
        () => {

            document.body.classList.toggle("dark");


            if (
                document.body.classList.contains("dark")
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


if (!currentUser) {

    alert(
        "⚠️ Please log in to view order details."
    );

    window.location.href =
        "login.html";

}


// ==========================================
// GET ORDER ID FROM URL
// ==========================================
//
// Example:
//
// order-details.html?id=KC-123456
//
// ==========================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );


const requestedOrderId =
    urlParams.get("id");


// ==========================================
// GET ALL ORDERS
// ==========================================

let orders =
    JSON.parse(
        localStorage.getItem("orders")
    ) || [];


// ==========================================
// FIND ORDER
// ==========================================

let order =
    orders.find(
        item =>
            String(item.id) ===
            String(requestedOrderId)
    );


// ==========================================
// ELEMENTS
// ==========================================

const orderIdElement =
    document.getElementById("orderId");


const orderDateElement =
    document.getElementById("orderDate");


const orderStatusElement =
    document.getElementById("orderStatus");


const customerInfo =
    document.getElementById("customerInfo");


const deliveryInfo =
    document.getElementById("deliveryInfo");


const orderedItems =
    document.getElementById("orderedItems");


const itemCount =
    document.getElementById("itemCount");


const paymentMethod =
    document.getElementById("paymentMethod");


const subtotal =
    document.getElementById("subtotal");


const deliveryCharge =
    document.getElementById("deliveryCharge");


const total =
    document.getElementById("total");


// ==========================================
// CHECK ORDER
// ==========================================

if (!requestedOrderId) {

    showError(
        "No order ID was provided."
    );

} else if (!order) {

    showError(
        "The requested order could not be found."
    );

} else {

    displayOrder();

}


// ==========================================
// DISPLAY ORDER
// ==========================================

function displayOrder() {

    // ======================================
    // ORDER OVERVIEW
    // ======================================

    if (orderIdElement) {

        orderIdElement.textContent =
            order.id || "Unavailable";

    }


    if (orderDateElement) {

        orderDateElement.textContent =
            formatDate(
                order.createdAt
            );

    }


    if (orderStatusElement) {

        orderStatusElement.textContent =
            order.status ||
            "Placed";

    }


    // ======================================
    // CUSTOMER
    // ======================================

    displayCustomer();


    // ======================================
    // DELIVERY
    // ======================================

    displayDelivery();


    // ======================================
    // ITEMS
    // ======================================

    displayItems();


    // ======================================
    // PAYMENT
    // ======================================

    if (paymentMethod) {

        paymentMethod.textContent =
            order.paymentMethod ||
            "Not provided";

    }


    // ======================================
    // SUMMARY
    // ======================================

    if (subtotal) {

        subtotal.textContent =
            formatCurrency(
                order.subtotal
            );

    }


    if (deliveryCharge) {

        const charge =
            Number(
                order.deliveryCharge || 0
            );


        deliveryCharge.textContent =
            charge === 0
                ? "Free"
                : formatCurrency(
                    charge
                );

    }


    if (total) {

        total.textContent =
            formatCurrency(
                order.total
            );

    }

}


// ==========================================
// CUSTOMER INFORMATION
// ==========================================

function displayCustomer() {

    if (!customerInfo) {
        return;
    }


    const buyer =
        order.buyer || {};


    customerInfo.innerHTML = `

        <div class="info-box">

            <span>
                Full Name
            </span>

            <strong>
                ${escapeHTML(
                    buyer.name ||
                    "Not provided"
                )}
            </strong>

        </div>


        <div class="info-box">

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


        <div class="info-box">

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

    `;

}


// ==========================================
// DELIVERY INFORMATION
// ==========================================

function displayDelivery() {

    if (!deliveryInfo) {
        return;
    }


    const delivery =
        order.deliveryAddress || {};


    deliveryInfo.innerHTML = `

        <div class="info-box">

            <span>
                Recipient
            </span>

            <strong>
                ${escapeHTML(
                    delivery.name ||
                    "Not provided"
                )}
            </strong>

        </div>


        <div class="info-box">

            <span>
                Phone
            </span>

            <strong>
                ${escapeHTML(
                    delivery.phone ||
                    "Not provided"
                )}
            </strong>

        </div>


        <div class="info-box">

            <span>
                Address
            </span>

            <strong>
                ${escapeHTML(
                    delivery.address ||
                    "Not provided"
                )}
            </strong>

        </div>


        <div class="info-box">

            <span>
                City
            </span>

            <strong>
                ${escapeHTML(
                    delivery.city ||
                    "Not provided"
                )}
            </strong>

        </div>


        <div class="info-box">

            <span>
                State
            </span>

            <strong>
                ${escapeHTML(
                    delivery.state ||
                    "Not provided"
                )}
            </strong>

        </div>


        <div class="info-box">

            <span>
                PIN Code
            </span>

            <strong>
                ${escapeHTML(
                    delivery.pincode ||
                    "Not provided"
                )}
            </strong>

        </div>

    `;

}


// ==========================================
// DISPLAY PRODUCTS
// ==========================================

function displayItems() {

    if (!orderedItems) {
        return;
    }


    const items =
        Array.isArray(order.items)
            ? order.items
            : [];


    const totalQuantity =
        items.reduce(
            (total, item) =>
                total +
                (Number(item.quantity) || 1),
            0
        );


    if (itemCount) {

        itemCount.textContent =
            `${totalQuantity} ${
                totalQuantity === 1
                    ? "item"
                    : "items"
            }`;

    }


    if (items.length === 0) {

        orderedItems.innerHTML = `

            <div class="empty-order">

                📦 No products found.

            </div>

        `;

        return;

    }


    orderedItems.innerHTML = "";


    items.forEach(item => {

        const quantity =
            Number(item.quantity) || 1;


        const price =
            Number(item.price) || 0;


        const itemTotal =
            price * quantity;


        let imageHTML = `

            <div class="item-image placeholder">

                📦

            </div>

        `;


        if (item.image) {

            imageHTML = `

                <div class="item-image">

                    <img
                        src="${escapeHTML(
                            item.image
                        )}"
                        alt="${escapeHTML(
                            item.productName ||
                            "Product"
                        )}"
                    >

                </div>

            `;

        }


        const element =
            document.createElement(
                "article"
            );


        element.className =
            "ordered-item";


        element.innerHTML = `

            ${imageHTML}


            <div class="item-info">

                <h3>

                    ${escapeHTML(
                        item.productName ||
                        "Unnamed Product"
                    )}

                </h3>


                <p>

                    Quantity:
                    ${quantity}

                </p>


                <p>

                    Unit Price:
                    ${formatCurrency(price)}

                </p>

            </div>


            <strong class="item-total">

                ${formatCurrency(
                    itemTotal
                )}

            </strong>

        `;


        orderedItems.appendChild(
            element
        );

    });

}


// ==========================================
// CANCEL ORDER
// ==========================================

function cancelOrder() {

    // ======================================
    // CHECK WHETHER ORDER EXISTS
    // ======================================

    if (!order) {

        alert(
            "⚠️ This order could not be found."
        );

        return;

    }


    // ======================================
    // CHECK ORDER OWNERSHIP
    // ======================================

    if (
        currentUser &&
        order.userId &&
        currentUser.id &&
        String(order.userId) !==
        String(currentUser.id)
    ) {

        alert(
            "⚠️ You cannot cancel this order."
        );

        return;

    }


    // ======================================
    // CONFIRM CANCELLATION
    // ======================================

    const confirmed =
        confirm(
            `Are you sure you want to cancel order ${order.id}?`
        );


    if (!confirmed) {

        return;

    }


    // ======================================
    // REMOVE ORDER
    // ======================================

    const updatedOrders =
        orders.filter(
            existingOrder =>
                String(existingOrder.id) !==
                String(order.id)
        );


    // ======================================
    // SAVE UPDATED ORDERS
    // ======================================

    localStorage.setItem(
        "orders",
        JSON.stringify(
            updatedOrders
        )
    );


    // ======================================
    // CLEAR LAST ORDER ID IF NECESSARY
    // ======================================

    const lastOrderId =
        localStorage.getItem(
            "lastOrderId"
        );


    if (
        String(lastOrderId) ===
        String(order.id)
    ) {

        localStorage.removeItem(
            "lastOrderId"
        );

    }


    // ======================================
    // SUCCESS MESSAGE
    // ======================================

    alert(
        `✅ Order ${order.id} has been cancelled successfully.`
    );


    // ======================================
    // RETURN TO ORDERS
    // ======================================

    window.location.href =
        "orders.html";

}


// ==========================================
// ERROR
// ==========================================

function showError(message) {

    if (orderIdElement) {

        orderIdElement.textContent =
            "Unavailable";

    }


    if (orderDateElement) {

        orderDateElement.textContent =
            "Unavailable";

    }


    if (orderStatusElement) {

        orderStatusElement.textContent =
            "Not Found";

    }


    if (customerInfo) {

        customerInfo.innerHTML = `

            <div class="error-box">

                ⚠️ ${escapeHTML(message)}

            </div>

        `;

    }


    if (deliveryInfo) {

        deliveryInfo.innerHTML = `

            <div class="error-box">

                ⚠️ Order delivery information
                is unavailable.

            </div>

        `;

    }


    if (orderedItems) {

        orderedItems.innerHTML = `

            <div class="error-box">

                📦 No order information found.

            </div>

        `;

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


console.log(
    "✅ Order Details system loaded successfully."
);