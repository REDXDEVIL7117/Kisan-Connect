/* ==========================================
   KISAN CONNECT MARKETPLACE
   marketplace.js
   STAGE 4.3
========================================== */


// ==========================================
// GET CURRENT USER
// ==========================================

const currentUser =
    JSON.parse(
        localStorage.getItem("currentUser")
    );


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
// ELEMENTS
// ==========================================

const productsContainer =
    document.getElementById(
        "productsContainer"
    );


const searchInput =
    document.getElementById(
        "searchInput"
    );


const categoryButtons =
    document.querySelectorAll(
        ".category-card"
    );


const clearFilterBtn =
    document.getElementById(
        "clearFilterBtn"
    );


// ==========================================
// LOAD LISTINGS
// ==========================================

let listings =
    JSON.parse(
        localStorage.getItem(
            "marketplaceListings"
        )
    ) || [];


let selectedCategory = "All";


// ==========================================
// DISPLAY LISTINGS
// ==========================================

function displayListings() {

    if (!productsContainer) {

        return;

    }


    const searchText =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const filteredListings =
        listings.filter(listing => {


            const matchesCategory =
                selectedCategory === "All" ||
                listing.category ===
                    selectedCategory;


            const searchableText =
                `${listing.productName}
                ${listing.description}
                ${listing.category}
                ${listing.location}`
                .toLowerCase();


            const matchesSearch =
                searchableText.includes(
                    searchText
                );


            return (
                matchesCategory &&
                matchesSearch
            );

        });


    productsContainer.innerHTML = "";


    // ======================================
    // NO RESULTS
    // ======================================

    if (filteredListings.length === 0) {

        productsContainer.innerHTML = `

            <div class="empty-marketplace">

                <div class="empty-icon">
                    🛒
                </div>

                <h3>No listings yet</h3>

                <p>
                    Be the first person to list
                    something on Kisan Connect
                    Marketplace.
                </p>

                <a
                    href="sell-product.html"
                    class="sell-btn">

                    + Sell Something

                </a>

            </div>

        `;

        return;

    }


    // ======================================
    // CREATE PRODUCT CARDS
    // ======================================

    filteredListings.forEach(listing => {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "product-card";


        // ==================================
        // PRODUCT IMAGE
        // ==================================

        let imageHTML = `

            <div class="product-image-placeholder">
                📦
            </div>

        `;


        if (
            listing.images &&
            listing.images.length > 0
        ) {

            imageHTML = `

                <img
                    class="product-image"
                    src="${listing.images[0]}"
                    alt="Product image"
                >

            `;

        }


        // ==================================
        // CHECK OWNERSHIP
        // ==================================

        let deleteButtonHTML = "";


        if (
            currentUser &&
            (
                listing.ownerId ===
                    currentUser.id ||

                listing.ownerEmail ===
                    currentUser.email
            )
        ) {

            deleteButtonHTML = `

                <button
                    class="delete-listing-btn"
                    data-id="${listing.id}">

                    🗑️ Delete Listing

                </button>

            `;

        }


        // ==================================
        // PRODUCT CARD
        // ==================================

        card.innerHTML = `

            ${imageHTML}

            <div class="product-card-content">

                <span class="product-category">

                    ${escapeHTML(
                        listing.category
                    )}

                </span>


                <h3>

                    ${escapeHTML(
                        listing.productName
                    )}

                </h3>


                <p class="product-description">

                    ${escapeHTML(
                        shortenText(
                            listing.description,
                            100
                        )
                    )}

                </p>


                <div class="product-price">

                    ₹${Number(
                        listing.price
                    ).toLocaleString(
                        "en-IN"
                    )}

                    <span>
                        /
                        ${escapeHTML(
                            listing.unit
                        )}
                    </span>

                </div>


                <p class="product-info">

                    📦
                    ${listing.quantity}
                    ${escapeHTML(
                        listing.unit
                    )}

                </p>


                <p class="product-info">

                    📍
                    ${escapeHTML(
                        listing.location
                    )}

                </p>


                <p class="product-info">

                    👤
                    ${escapeHTML(
                        listing.ownerName ||
                        "Marketplace User"
                    )}

                </p>


                <span class="available">

                    🟢
                    ${escapeHTML(
                        listing.status ||
                        "Available"
                    )}

                </span>


                <button
                    class="view-product-btn"
                    data-id="${listing.id}">

                    View Details

                </button>


                ${deleteButtonHTML}

            </div>

        `;


        productsContainer.appendChild(
            card
        );

    });


    // ======================================
    // VIEW DETAILS
    // ======================================

    document
        .querySelectorAll(
            ".view-product-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const productId =
                        Number(
                            button.dataset.id
                        );


                    localStorage.setItem(
                        "selectedProductId",
                        productId
                    );


                    window.location.href =
                      "product-details.html";

                }
            );

        });


    // ======================================
    // DELETE LISTING
    // ======================================

    document
        .querySelectorAll(
            ".delete-listing-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const productId =
                        Number(
                            button.dataset.id
                        );


                    // Find listing

                    const listing =
                        listings.find(
                            item =>
                                item.id ===
                                productId
                        );


                    if (!listing) {

                        alert(
                            "❌ Listing not found."
                        );

                        return;

                    }


                    // ==================================
                    // SECURITY CHECK
                    // ==================================

                    const isOwner =
                        currentUser &&
                        (
                            listing.ownerId ===
                                currentUser.id ||

                            listing.ownerEmail ===
                                currentUser.email
                        );


                    if (!isOwner) {

                        alert(
                            "❌ You can only delete your own listings."
                        );

                        return;

                    }


                    // ==================================
                    // CONFIRM DELETE
                    // ==================================

                    const confirmation =
                        confirm(
                            `Are you sure you want to delete "${listing.productName}"?`
                        );


                    if (!confirmation) {

                        return;

                    }


                    // ==================================
                    // REMOVE LISTING
                    // ==================================

                    listings =
                        listings.filter(
                            item =>
                                item.id !==
                                productId
                        );


                    // ==================================
                    // SAVE UPDATED LIST
                    // ==================================

                    localStorage.setItem(
                        "marketplaceListings",
                        JSON.stringify(
                            listings
                        )
                    );


                    alert(
                        "🗑️ Listing deleted successfully."
                    );


                    // ==================================
                    // REFRESH MARKETPLACE
                    // ==================================

                    displayListings();

                });

        });

}


// ==========================================
// SEARCH
// ==========================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        displayListings
    );

}


// ==========================================
// CATEGORY FILTER
// ==========================================

categoryButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const category =
                button.dataset.category;


            if (
                category ===
                "Livestock"
            ) {

                alert(
                    "🐄 Livestock marketplace will be available in a future update."
                );

                return;

            }


            selectedCategory =
                category;


            if (searchInput) {

                searchInput.value =
                    "";

            }


            displayListings();

        }
    );

});


// ==========================================
// SHOW ALL
// ==========================================

if (clearFilterBtn) {

    clearFilterBtn.addEventListener(
        "click",
        () => {

            selectedCategory =
                "All";


            if (searchInput) {

                searchInput.value =
                    "";

            }


            displayListings();

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


// ==========================================
// SHORTEN DESCRIPTION
// ==========================================

function shortenText(
    text,
    maxLength
) {

    text =
        String(text);


    if (
        text.length <=
        maxLength
    ) {

        return text;

    }


    return (
        text.substring(
            0,
            maxLength
        ) + "..."
    );

}


// ==========================================
// INITIAL LOAD
// ==========================================

displayListings();


console.log(
    `🛒 ${listings.length} listing(s) loaded.`
);