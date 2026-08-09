/* ==========================================
   KISAN CONNECT
   seller-dashboard.js
   STAGE 4.8.1
========================================== */

console.log("🌾 Seller Dashboard loaded.");


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
        "⚠️ Please log in to access the Seller Dashboard."
    );

    window.location.href =
        "login.html";

}


// ==========================================
// SELLER ROLE CHECK
// ==========================================

if (
    currentUser &&
    currentUser.role &&
    currentUser.role.toLowerCase() !== "seller"
) {

    alert(
        "⚠️ This dashboard is only available to sellers."
    );

    window.location.href =
        "farmer-dashboard.html";

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
// ELEMENTS
// ==========================================

const sellerName =
    document.getElementById(
        "sellerName"
    );


const sellerProfile =
    document.getElementById(
        "sellerProfile"
    );


const productCount =
    document.getElementById(
        "productCount"
    );


const orderCount =
    document.getElementById(
        "orderCount"
    );


const salesTotal =
    document.getElementById(
        "salesTotal"
    );


// ==========================================
// GET MARKETPLACE LISTINGS
// ==========================================

const allListings =
    JSON.parse(
        localStorage.getItem(
            "marketplaceListings"
        )
    ) || [];


// ==========================================
// GET ALL ORDERS
// ==========================================

const allOrders =
    JSON.parse(
        localStorage.getItem(
            "orders"
        )
    ) || [];


// ==========================================
// SELLER IDENTIFICATION
// ==========================================
//
// Listings created by the current seller
// contain seller information.
//
// We prefer seller ID.
// Email is used as a fallback for
// older listings.
//

function isMyListing(listing) {

    if (
        !currentUser ||
        !listing ||
        !listing.seller
    ) {

        return false;

    }


    // ======================================
    // MATCH BY USER ID
    // ======================================

    if (
        currentUser.id &&
        listing.seller.id
    ) {

        return (
            String(
                listing.seller.id
            ) ===
            String(
                currentUser.id
            )
        );

    }


    // ======================================
    // FALLBACK TO EMAIL
    // ======================================

    if (
        currentUser.email &&
        listing.seller.email
    ) {

        return (
            listing.seller.email
                .toLowerCase()
                ===
            currentUser.email
                .toLowerCase()
        );

    }


    return false;

}


// ==========================================
// GET MY PRODUCTS
// ==========================================

function getMyProducts() {

    return allListings.filter(
        listing =>
            isMyListing(listing)
    );

}


// ==========================================
// FIND SELLER PRODUCTS IN ORDERS
// ==========================================
//
// An order can contain products from
// multiple sellers.
//
// Therefore we DO NOT count the entire
// order as the seller's sale.
//
// We only count products belonging to
// this seller.
//

function getSellerOrderData() {

    const myProducts =
        getMyProducts();


    // IDs of this seller's listings

    const myProductIds =
        new Set(
            myProducts.map(
                product =>
                    String(product.id)
            )
        );


    let sellerOrders = 0;

    let sellerSales = 0;


    allOrders.forEach(order => {

        const items =
            Array.isArray(order.items)
                ? order.items
                : [];


        let containsSellerProduct =
            false;


        items.forEach(item => {

            // ==================================
            // CHECK PRODUCT ID
            // ==================================

            if (
                item.id &&
                myProductIds.has(
                    String(item.id)
                )
            ) {

                containsSellerProduct =
                    true;


                const price =
                    Number(
                        item.price
                    ) || 0;


                const quantity =
                    Number(
                        item.quantity
                    ) || 1;


                sellerSales +=
                    price * quantity;


                return;

            }


            // ==================================
            // FALLBACK SELLER INFORMATION
            // ==================================

            if (
                item.seller &&
                isSellerMatch(
                    item.seller
                )
            ) {

                containsSellerProduct =
                    true;


                const price =
                    Number(
                        item.price
                    ) || 0;


                const quantity =
                    Number(
                        item.quantity
                    ) || 1;


                sellerSales +=
                    price * quantity;

            }

        });


        if (containsSellerProduct) {

            sellerOrders++;

        }

    });


    return {

        orders:
            sellerOrders,

        sales:
            sellerSales

    };

}


// ==========================================
// SELLER MATCH
// ==========================================

function isSellerMatch(seller) {

    if (
        !seller ||
        !currentUser
    ) {

        return false;

    }


    // Match by ID

    if (
        currentUser.id &&
        seller.id
    ) {

        return (
            String(
                currentUser.id
            ) ===
            String(
                seller.id
            )
        );

    }


    // Match by email

    if (
        currentUser.email &&
        seller.email
    ) {

        return (
            currentUser.email
                .toLowerCase()
                ===
            seller.email
                .toLowerCase()
        );

    }


    return false;

}


// ==========================================
// DISPLAY SELLER NAME
// ==========================================

function displaySellerName() {

    if (!sellerName) {

        return;

    }


    sellerName.textContent =
        currentUser.name ||
        "Seller";

}


// ==========================================
// DISPLAY SELLER PROFILE
// ==========================================

function displaySellerProfile() {

    if (!sellerProfile) {

        return;

    }


    sellerProfile.innerHTML = `

        <div class="profile-info-box">

            <span>
                Name
            </span>

            <strong>
                ${escapeHTML(
                    currentUser.name ||
                    "Not provided"
                )}
            </strong>

        </div>


        <div class="profile-info-box">

            <span>
                Email
            </span>

            <strong>
                ${escapeHTML(
                    currentUser.email ||
                    "Not provided"
                )}
            </strong>

        </div>


        <div class="profile-info-box">

            <span>
                Phone
            </span>

            <strong>
                ${escapeHTML(
                    currentUser.phone ||
                    "Not provided"
                )}
            </strong>

        </div>


        <div class="profile-info-box">

            <span>
                Role
            </span>

            <strong>
                ${escapeHTML(
                    currentUser.role ||
                    "Seller"
                )}
            </strong>

        </div>

    `;

}


// ==========================================
// DISPLAY STATISTICS
// ==========================================

function displayStatistics() {

    const myProducts =
        getMyProducts();


    const sellerOrderData =
        getSellerOrderData();


    // ======================================
    // PRODUCT COUNT
    // ======================================

    if (productCount) {

        productCount.textContent =
            myProducts.length;

    }


    // ======================================
    // ORDER COUNT
    // ======================================

    if (orderCount) {

        orderCount.textContent =
            sellerOrderData.orders;

    }


    // ======================================
    // SALES TOTAL
    // ======================================

    if (salesTotal) {

        salesTotal.textContent =
            formatCurrency(
                sellerOrderData.sales
            );

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
// INITIALIZE DASHBOARD
// ==========================================

displaySellerName();

displaySellerProfile();

displayStatistics();


console.log(
    "✅ Seller Dashboard system loaded successfully."
);