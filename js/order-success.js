/* ==========================================
   KISAN CONNECT
   order-success.js
   STAGE 4.6.2.2
========================================== */


console.log(
    "✅ Order Success page loaded."
);


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
// GET LAST ORDER
// ==========================================
//
// checkout.js saves:
// 1. All orders → "orders"
// 2. Latest order ID → "lastOrderId"
//
// We use both to find the exact order.
// ==========================================

const lastOrderId =
    localStorage.getItem(
        "lastOrderId"
    );


const orders =
    JSON.parse(
        localStorage.getItem(
            "orders"
        )
    ) || [];


const lastOrder =
    orders.find(
        order =>
            String(order.id) ===
            String(lastOrderId)
    );


// ==========================================
// ELEMENTS
// ==========================================

const orderIdElement =
    document.getElementById(
        "orderId"
    );


const orderDateElement =
    document.getElementById(
        "orderDate"
    );


const customerInfo =
    document.getElementById(
        "customerInfo"
    );


const orderedItems =
    document.getElementById(
        "orderedItems"
    );


const orderItemCount =
    document.getElementById(
        "orderItemCount"
    );


const summaryItemCount =
    document.getElementById(
        "summaryItemCount"
    );


const orderSubtotal =
    document.getElementById(
        "orderSubtotal"
    );


const orderDelivery =
    document.getElementById(
        "orderDelivery"
    );


const orderTotal =
    document.getElementById(
        "orderTotal"
    );


const orderStatus =
    document.getElementById(
        "orderStatus"
    );


// ==========================================
// ORDER NOT FOUND
// ==========================================

if (!lastOrder) {

    showOrderError();

} else {

    displayOrder();

}


// ==========================================
// DISPLAY ORDER
// ==========================================

function displayOrder() {


    // ======================================
    // ORDER ID
    // ======================================

    if (orderIdElement) {

        orderIdElement.textContent =
            lastOrder.id ||
            "Not available";

    }


    // ======================================
    // ORDER DATE
    // ======================================

    if (orderDateElement) {

        orderDateElement.textContent =
            formatDate(
                lastOrder.createdAt
            );

    }


    // ======================================
    // CUSTOMER INFORMATION
    // ======================================

    displayCustomer();


    // ======================================
    // ORDER ITEMS
    // ======================================

    displayItems();


    // ======================================
    // ORDER SUMMARY
    // ======================================

    const items =
        Array.isArray(lastOrder.items)
            ? lastOrder.items
            : [];


    const itemCount =
        items.reduce(
            (total, item) =>
                total +
                Number(
                    item.quantity || 1
                ),
            0
        );


    if (summaryItemCount) {

        summaryItemCount.textContent =
            itemCount;

    }


    if (orderItemCount) {

        orderItemCount.textContent =
            `${itemCount} ${
                itemCount === 1
                    ? "item"
                    : "items"
            }`;

    }


    if (orderSubtotal) {

        orderSubtotal.textContent =
            formatCurrency(
                lastOrder.subtotal
            );

    }


    if (orderDelivery) {

        orderDelivery.textContent =
            Number(
                lastOrder.deliveryCharge || 0
            ) === 0
                ? "Free"
                : formatCurrency(
                    lastOrder.deliveryCharge
                );

    }


    if (orderTotal) {

        orderTotal.textContent =
            formatCurrency(
                lastOrder.total
            );

    }


    // ======================================
    // ORDER STATUS
    // ======================================

    if (orderStatus) {

        orderStatus.textContent =
            lastOrder.status ||
            "Order Placed";

    }

}


// ==========================================
// DISPLAY CUSTOMER
// ==========================================

function displayCustomer() {

    if (!customerInfo) {

        return;

    }


    // ======================================
    // BUYER INFORMATION
    // ======================================

    const buyer =
        lastOrder.buyer || {};


    // ======================================
    // DELIVERY INFORMATION
    // ======================================

    const delivery =
        lastOrder.deliveryAddress || {};


    const name =
        buyer.name ||
        delivery.name ||
        "Not provided";


    const email =
        buyer.email ||
        "Not provided";


    const phone =
        delivery.phone ||
        buyer.phone ||
        "Not provided";


    const addressParts = [

        delivery.address,

        delivery.city,

        delivery.state,

        delivery.pincode

    ].filter(Boolean);


    const address =
        addressParts.length > 0
            ? addressParts.join(", ")
            : "Not provided";


    customerInfo.innerHTML = `

        <div class="customer-info-item">

            <span>
                Full Name
            </span>

            <strong>
                ${escapeHTML(name)}
            </strong>

        </div>


        <div class="customer-info-item">

            <span>
                Email
            </span>

            <strong>
                ${escapeHTML(email)}
            </strong>

        </div>


        <div class="customer-info-item">

            <span>
                Phone
            </span>

            <strong>
                ${escapeHTML(phone)}
            </strong>

        </div>


        <div class="customer-info-item">

            <span>
                Delivery Address
            </span>

            <strong>
                ${escapeHTML(address)}
            </strong>

        </div>


        <div class="customer-info-item">

            <span>
                Payment Method
            </span>

            <strong>
                ${escapeHTML(
                    lastOrder.paymentMethod ||
                    "Not provided"
                )}
            </strong>

        </div>

    `;

}


// ==========================================
// DISPLAY ORDER ITEMS
// ==========================================

function displayItems() {

    if (!orderedItems) {

        return;

    }


    const items =
        Array.isArray(lastOrder.items)
            ? lastOrder.items
            : [];


    // ======================================
    // NO ITEMS
    // ======================================

    if (items.length === 0) {

        orderedItems.innerHTML = `

            <div class="empty-order">

                <div class="empty-order-icon">
                    📦
                </div>

                <p>
                    No products were found
                    in this order.
                </p>

            </div>

        `;

        return;

    }


    orderedItems.innerHTML = "";


    // ======================================
    // DISPLAY EACH PRODUCT
    // ======================================

    items.forEach(
        item => {

            const quantity =
                Number(
                    item.quantity || 1
                );


            const price =
                Number(
                    item.price || 0
                );


            const itemTotal =
                price *
                quantity;


            // ==================================
            // PRODUCT IMAGE
            // ==================================

            let imageHTML = `

                <div class="ordered-item-placeholder">

                    📦

                </div>

            `;


            /*
                checkout.js saves images as:

                images: product.images || []

                So we support:

                1. item.image
                2. item.images[0]

                This keeps older orders compatible too.
            */

            const productImage =
                item.image ||
                (
                    Array.isArray(item.images) &&
                    item.images.length > 0
                        ? item.images[0]
                        : null
                );


            if (productImage) {

                imageHTML = `

                    <img
                        src="${escapeHTML(
                            productImage
                        )}"
                        alt="${escapeHTML(
                            item.productName ||
                            "Product"
                        )}"
                        class="ordered-item-image"
                    >

                `;

            }


            // ==================================
            // CREATE ITEM
            // ==================================

            const itemElement =
                document.createElement(
                    "article"
                );


            itemElement.className =
                "ordered-item";


            itemElement.innerHTML = `

                ${imageHTML}


                <div class="ordered-item-info">

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

                        Price:
                        ${formatCurrency(
                            price
                        )}

                    </p>

                </div>


                <div class="ordered-item-price">

                    ${formatCurrency(
                        itemTotal
                    )}

                </div>

            `;


            orderedItems.appendChild(
                itemElement
            );

        }
    );

}


// ==========================================
// ORDER ERROR
// ==========================================

function showOrderError() {


    if (orderIdElement) {

        orderIdElement.textContent =
            "Unavailable";

    }


    if (orderDateElement) {

        orderDateElement.textContent =
            "Unavailable";

    }


    if (customerInfo) {

        customerInfo.innerHTML = `

            <div class="empty-order">

                <div class="empty-order-icon">
                    ⚠️
                </div>

                <p>

                    No recent order information
                    could be found.

                </p>

            </div>

        `;

    }


    if (orderedItems) {

        orderedItems.innerHTML = `

            <div class="empty-order">

                <div class="empty-order-icon">
                    📦
                </div>

                <p>

                    There is no recent order
                    to display.

                </p>


                <a
                    href="marketplace.html"
                    class="secondary-action-btn"
                >

                    ← Return to Marketplace

                </a>

            </div>

        `;

    }


    if (orderStatus) {

        orderStatus.textContent =
            "No Order Found";

    }


    // Reset summary if order doesn't exist

    if (summaryItemCount) {

        summaryItemCount.textContent =
            "0";

    }


    if (orderItemCount) {

        orderItemCount.textContent =
            "0 items";

    }


    if (orderSubtotal) {

        orderSubtotal.textContent =
            "₹0";

    }


    if (orderDelivery) {

        orderDelivery.textContent =
            "₹0";

    }


    if (orderTotal) {

        orderTotal.textContent =
            "₹0";

    }

}


// ==========================================
// FORMAT CURRENCY
// ==========================================

function formatCurrency(value) {

    const amount =
        Number(value || 0);


    return `₹${amount.toLocaleString(
        "en-IN"
    )}`;

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


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return "Unknown";

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
// COMPLETE
// ==========================================

console.log(
    "✅ Order confirmation system loaded successfully."
);