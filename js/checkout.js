/* ==========================================
   KISAN CONNECT
   checkout.js
   STAGE 4.6.2.1
========================================== */

console.log("🧾 Checkout page loaded.");


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
        "⚠️ Please log in before proceeding to checkout."
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
// GET CART
// ==========================================

let cart =
    JSON.parse(
        localStorage.getItem(
            "cart"
        )
    ) || [];


// ==========================================
// ELEMENTS
// ==========================================

const buyerInfo =
    document.getElementById(
        "buyerInfo"
    );


const checkoutItems =
    document.getElementById(
        "checkoutItems"
    );


const checkoutItemCount =
    document.getElementById(
        "checkoutItemCount"
    );


const checkoutSubtotal =
    document.getElementById(
        "checkoutSubtotal"
    );


const checkoutDelivery =
    document.getElementById(
        "checkoutDelivery"
    );


const checkoutTotal =
    document.getElementById(
        "checkoutTotal"
    );


const checkoutForm =
    document.getElementById(
        "checkoutForm"
    );


const placeOrderBtn =
    document.getElementById(
        "placeOrderBtn"
    );


// ==========================================
// DELIVERY CHARGE
// ==========================================
//
// For now delivery is free.
// A real delivery calculation can be
// added later based on location/distance.
//

const DELIVERY_CHARGE = 0;


// ==========================================
// DISPLAY BUYER INFORMATION
// ==========================================

function displayBuyerInfo() {

    if (!buyerInfo) {
        return;
    }


    buyerInfo.innerHTML = `

        <div class="buyer-info-item">

            <strong>
                Name
            </strong>

            <span>
                ${escapeHTML(
                    currentUser.name ||
                    "Not provided"
                )}
            </span>

        </div>


        <div class="buyer-info-item">

            <strong>
                Email
            </strong>

            <span>
                ${escapeHTML(
                    currentUser.email ||
                    "Not provided"
                )}
            </span>

        </div>


        <div class="buyer-info-item">

            <strong>
                Phone
            </strong>

            <span>
                ${escapeHTML(
                    currentUser.phone ||
                    "Not provided"
                )}
            </span>

        </div>


        <div class="buyer-info-item">

            <strong>
                Account Role
            </strong>

            <span>
                ${escapeHTML(
                    currentUser.role ||
                    "User"
                )}
            </span>

        </div>

    `;


    // Auto-fill delivery fields

    const deliveryName =
        document.getElementById(
            "deliveryName"
        );


    const deliveryPhone =
        document.getElementById(
            "deliveryPhone"
        );


    if (
        deliveryName &&
        currentUser.name
    ) {

        deliveryName.value =
            currentUser.name;

    }


    if (
        deliveryPhone &&
        currentUser.phone
    ) {

        deliveryPhone.value =
            currentUser.phone;

    }

}


// ==========================================
// DISPLAY CART
// ==========================================

function displayCheckoutItems() {

    if (!checkoutItems) {
        return;
    }


    checkoutItems.innerHTML = "";


    // ======================================
    // EMPTY CART
    // ======================================

    if (cart.length === 0) {

        checkoutItems.innerHTML = `

            <div class="checkout-empty">

                <div class="checkout-empty-icon">
                    🛒
                </div>

                <h3>
                    Your cart is empty
                </h3>

                <p>
                    Add products to your cart
                    before checking out.
                </p>

            </div>

        `;


        if (placeOrderBtn) {

            placeOrderBtn.disabled =
                true;

        }


        return;

    }


    // ======================================
    // CART ITEMS
    // ======================================

    cart.forEach(item => {

        const quantity =
            Number(
                item.quantity
            ) || 1;


        const price =
            Number(
                item.price
            ) || 0;


        const itemTotal =
            price * quantity;


        let imageHTML = `

            <div class="checkout-item-image">

                📦

            </div>

        `;


        if (
            item.image ||
            (
                item.images &&
                item.images.length > 0
            )
        ) {

            const image =
                item.image ||
                item.images[0];


            imageHTML = `

                <div class="checkout-item-image">

                    <img
                        src="${escapeHTML(
                            image
                        )}"
                        alt="${escapeHTML(
                            item.productName ||
                            "Product"
                        )}"
                    >

                </div>

            `;

        }


        const itemElement =
            document.createElement(
                "div"
            );


        itemElement.className =
            "checkout-item";


        itemElement.innerHTML = `

            ${imageHTML}


            <div class="checkout-item-info">

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
                    ₹${price.toLocaleString(
                        "en-IN"
                    )}

                </p>


                <div class="checkout-item-price">

                    ₹${itemTotal.toLocaleString(
                        "en-IN"
                    )}

                </div>

            </div>

        `;


        checkoutItems.appendChild(
            itemElement
        );

    });

}


// ==========================================
// CALCULATE ORDER
// ==========================================

function calculateOrder() {

    let subtotal = 0;

    let totalQuantity = 0;


    cart.forEach(item => {

        const price =
            Number(
                item.price
            ) || 0;


        const quantity =
            Number(
                item.quantity
            ) || 1;


        subtotal +=
            price * quantity;


        totalQuantity +=
            quantity;

    });


    const total =
        subtotal +
        DELIVERY_CHARGE;


    return {

        subtotal:
            subtotal,

        delivery:
            DELIVERY_CHARGE,

        total:
            total,

        quantity:
            totalQuantity

    };

}


// ==========================================
// DISPLAY ORDER SUMMARY
// ==========================================

function displayOrderSummary() {

    const order =
        calculateOrder();


    if (checkoutItemCount) {

        checkoutItemCount.textContent =
            order.quantity;

    }


    if (checkoutSubtotal) {

        checkoutSubtotal.textContent =
            `₹${order.subtotal.toLocaleString(
                "en-IN"
            )}`;

    }


    if (checkoutDelivery) {

        checkoutDelivery.textContent =
            DELIVERY_CHARGE === 0
                ? "Free"
                : `₹${DELIVERY_CHARGE.toLocaleString(
                    "en-IN"
                )}`;

    }


    if (checkoutTotal) {

        checkoutTotal.textContent =
            `₹${order.total.toLocaleString(
                "en-IN"
            )}`;

    }

}


// ==========================================
// VALIDATE DELIVERY INFORMATION
// ==========================================

function validateDeliveryInformation() {

    const deliveryName =
        document.getElementById(
            "deliveryName"
        );


    const deliveryPhone =
        document.getElementById(
            "deliveryPhone"
        );


    const deliveryAddress =
        document.getElementById(
            "deliveryAddress"
        );


    const deliveryCity =
        document.getElementById(
            "deliveryCity"
        );


    const deliveryState =
        document.getElementById(
            "deliveryState"
        );


    const deliveryPincode =
        document.getElementById(
            "deliveryPincode"
        );


    if (
        !deliveryName ||
        !deliveryPhone ||
        !deliveryAddress ||
        !deliveryCity ||
        !deliveryState ||
        !deliveryPincode
    ) {

        alert(
            "⚠️ Some delivery fields are missing."
        );

        return false;

    }


    const name =
        deliveryName.value.trim();


    const phone =
        deliveryPhone.value.trim();


    const address =
        deliveryAddress.value.trim();


    const city =
        deliveryCity.value.trim();


    const state =
        deliveryState.value.trim();


    const pincode =
        deliveryPincode.value.trim();


    if (
        !name ||
        !phone ||
        !address ||
        !city ||
        !state ||
        !pincode
    ) {

        alert(
            "⚠️ Please fill in all delivery information."
        );

        return false;

    }


    // ======================================
    // PHONE VALIDATION
    // ======================================

    const phoneDigits =
        phone.replace(
            /\D/g,
            ""
        );


    if (
        phoneDigits.length < 10
    ) {

        alert(
            "⚠️ Please enter a valid phone number."
        );

        return false;

    }


    // ======================================
    // PIN CODE VALIDATION
    // ======================================

    if (
        !/^\d{6}$/.test(
            pincode
        )
    ) {

        alert(
            "⚠️ Please enter a valid 6-digit PIN code."
        );

        return false;

    }


    return {

        name:
            name,

        phone:
            phone,

        address:
            address,

        city:
            city,

        state:
            state,

        pincode:
            pincode

    };

}


// ==========================================
// GET PAYMENT METHOD
// ==========================================

function getPaymentMethod() {

    const selectedPayment =
        document.querySelector(
            'input[name="paymentMethod"]:checked'
        );


    if (!selectedPayment) {

        return "Cash on Delivery";

    }


    return selectedPayment.value;

}


// ==========================================
// PLACE ORDER
// ==========================================

if (checkoutForm) {

    checkoutForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            // ==================================
            // CHECK CART
            // ==================================

            if (cart.length === 0) {

                alert(
                    "🛒 Your cart is empty."
                );

                window.location.href =
                    "marketplace.html";

                return;

            }


            // ==================================
            // VALIDATE DELIVERY
            // ==================================

            const delivery =
                validateDeliveryInformation();


            if (!delivery) {

                return;

            }


            // ==================================
            // PAYMENT
            // ==================================

            const paymentMethod =
                getPaymentMethod();


            // ==================================
            // ONLINE PAYMENT
            // ==================================

            if (
                paymentMethod ===
                "Online Payment"
            ) {

                alert(
                    "💳 Online payment will be available in a future update. Please select Cash on Delivery for now."
                );

                return;

            }


            // ==================================
            // CALCULATE TOTAL
            // ==================================

            const orderSummary =
                calculateOrder();


            // ==================================
            // CREATE ORDER ID
            // ==================================

            const orderId =
                "KC-" +
                Date.now();


            // ==================================
            // CREATE ORDER
            // ==================================

            const order = {

                id:
                    orderId,

                userId:
                    currentUser.id ||
                    null,

                buyer: {

                    name:
                        currentUser.name ||
                        delivery.name,

                    email:
                        currentUser.email ||
                        "",

                    phone:
                        delivery.phone

                },

                deliveryAddress: {

                    name:
                        delivery.name,

                    phone:
                        delivery.phone,

                    address:
                        delivery.address,

                    city:
                        delivery.city,

                    state:
                        delivery.state,

                    pincode:
                        delivery.pincode

                },

                items:
                    cart.map(
                        item => ({
                            ...item
                        })
                    ),

                paymentMethod:
                    paymentMethod,

                subtotal:
                    orderSummary.subtotal,

                deliveryCharge:
                    orderSummary.delivery,

                total:
                    orderSummary.total,

                status:
                    "Placed",

                createdAt:
                    new Date().toISOString(),

                updatedAt:
                    new Date().toISOString()

            };


            // ==================================
            // GET EXISTING ORDERS
            // ==================================

            let orders =
                JSON.parse(
                    localStorage.getItem(
                        "orders"
                    )
                ) || [];


            // ==================================
            // SAVE ORDER
            // ==================================

            orders.push(
                order
            );


            localStorage.setItem(
                "orders",
                JSON.stringify(
                    orders
                )
            );


            // ==================================
            // CLEAR CART
            // ==================================

            localStorage.setItem(
                "cart",
                JSON.stringify([])
            );


            // ==================================
            // SAVE LAST ORDER
            // ==================================

            localStorage.setItem(
                "lastOrderId",
                orderId
            );


            // ==================================
            // SUCCESS
            // ==================================

            alert(
                `✅ Order ${orderId} placed successfully!`
            );


            // ==================================
            // GO TO SUCCESS PAGE
            // ==================================

            window.location.href =
                "order-success.html";

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

displayBuyerInfo();

displayCheckoutItems();

displayOrderSummary();


console.log(
    "✅ Checkout System Loaded Successfully!"
);