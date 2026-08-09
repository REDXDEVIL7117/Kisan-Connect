/* ==========================================
   KISAN CONNECT
   seller-products.js
   STAGE 4.8.4
========================================== */

console.log(
    "🛍️ Seller Products page loaded."
);


// ==========================================
// GET CURRENT USER
// ==========================================

const currentUser =
    JSON.parse(
        localStorage.getItem("currentUser")
    );


// ==========================================
// SELLER ACCESS CHECK
// ==========================================

if (!currentUser) {

    alert(
        "⚠️ Please log in to manage your products."
    );

    window.location.href =
        "login.html";

}


// ==========================================
// ELEMENTS
// ==========================================

const productsContainer =
    document.getElementById(
        "sellerProductsContainer"
    );


const productSearch =
    document.getElementById(
        "productSearch"
    );


const categoryFilter =
    document.getElementById(
        "categoryFilter"
    );


const productCount =
    document.getElementById(
        "productCount"
    );


const clearFiltersBtn =
    document.getElementById(
        "clearFiltersBtn"
    );


const themeBtn =
    document.getElementById(
        "themeBtn"
    );


// ==========================================
// EDIT MODAL ELEMENTS
// ==========================================

const editModal =
    document.getElementById(
        "editModal"
    );


const closeModalBtn =
    document.getElementById(
        "closeModalBtn"
    );


const cancelEditBtn =
    document.getElementById(
        "cancelEditBtn"
    );


const editProductForm =
    document.getElementById(
        "editProductForm"
    );


const editProductId =
    document.getElementById(
        "editProductId"
    );


const editProductName =
    document.getElementById(
        "editProductName"
    );


const editCategory =
    document.getElementById(
        "editCategory"
    );


const editPrice =
    document.getElementById(
        "editPrice"
    );


const editQuantity =
    document.getElementById(
        "editQuantity"
    );


const editUnit =
    document.getElementById(
        "editUnit"
    );


const editLocation =
    document.getElementById(
        "editLocation"
    );


const editDescription =
    document.getElementById(
        "editDescription"
    );


// ==========================================
// DARK MODE
// ==========================================

if (
    localStorage.getItem("theme") ===
    "dark"
) {

    document.body.classList.add(
        "dark"
    );


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

            }

            else {

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
// LOAD MARKETPLACE LISTINGS
// ==========================================

let listings =
    JSON.parse(
        localStorage.getItem(
            "marketplaceListings"
        )
    ) || [];


// ==========================================
// GET SELLER'S PRODUCTS
// ==========================================

function getSellerProducts() {

    if (!currentUser) {

        return [];

    }


    return listings.filter(
        listing => {

            return (

                (
                    listing.ownerId &&
                    currentUser.id &&
                    String(
                        listing.ownerId
                    ) ===
                    String(
                        currentUser.id
                    )
                )

                ||

                (
                    listing.ownerEmail &&
                    currentUser.email &&
                    String(
                        listing.ownerEmail
                    ).toLowerCase() ===
                    String(
                        currentUser.email
                    ).toLowerCase()
                )

            );

        }
    );

}


// ==========================================
// DISPLAY PRODUCTS
// ==========================================

function displayProducts() {

    if (!productsContainer) {

        return;

    }


    const sellerProducts =
        getSellerProducts();


    const searchText =
        productSearch
            ? productSearch.value
                .toLowerCase()
                .trim()
            : "";


    const selectedCategory =
        categoryFilter
            ? categoryFilter.value
            : "All";


    const filteredProducts =
        sellerProducts.filter(
            product => {

                const matchesSearch =
                    `${product.productName}
                    ${product.description}
                    ${product.category}
                    ${product.location}`
                    .toLowerCase()
                    .includes(
                        searchText
                    );


                const matchesCategory =
                    selectedCategory ===
                        "All" ||

                    product.category ===
                        selectedCategory;


                return (
                    matchesSearch &&
                    matchesCategory
                );

            }
        );


    // ======================================
    // COUNT
    // ======================================

    if (productCount) {

        productCount.textContent =
            sellerProducts.length;

    }


    productsContainer.innerHTML =
        "";


    // ======================================
    // EMPTY STATE
    // ======================================

    if (
        filteredProducts.length ===
        0
    ) {

        productsContainer.innerHTML = `

            <div class="empty-products">

                <div class="empty-products-icon">
                    🛍️
                </div>

                <h2>
                    ${
                        sellerProducts.length ===
                        0
                            ? "You haven't listed any products yet"
                            : "No products found"
                    }
                </h2>

                <p>
                    ${
                        sellerProducts.length ===
                        0
                            ? "Start selling agricultural products on Kisan Connect."
                            : "Try changing your search or category filter."
                    }
                </p>

                ${
                    sellerProducts.length ===
                    0
                        ? `
                            <a
                                href="sell-product.html"
                                class="add-product-btn"
                            >
                                ➕ Add Your First Product
                            </a>
                        `
                        : ""
                }

            </div>

        `;

        return;

    }


    // ======================================
    // CREATE CARDS
    // ======================================

    filteredProducts.forEach(
        product => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "seller-product-card";


            // ==================================
            // IMAGE
            // ==================================

            let imageHTML = `

                <div class="seller-product-placeholder">
                    📦
                </div>

            `;


            if (
                Array.isArray(
                    product.images
                ) &&
                product.images.length >
                    0
            ) {

                imageHTML = `

                    <img
                        class="seller-product-image"
                        src="${escapeHTML(
                            product.images[0]
                        )}"
                        alt="${escapeHTML(
                            product.productName ||
                            "Product"
                        )}"
                    >

                `;

            }


            // ==================================
            // STATUS
            // ==================================

            const status =
                product.status ||
                "Available";


            const isAvailable =
                status.toLowerCase() ===
                "available";


            // ==================================
            // CARD
            // ==================================

            card.innerHTML = `

                ${imageHTML}


                <div class="seller-product-content">

                    <span class="product-category">

                        ${escapeHTML(
                            product.category ||
                            "Other"
                        )}

                    </span>


                    <h3>

                        ${escapeHTML(
                            product.productName ||
                            "Unnamed Product"
                        )}

                    </h3>


                    <p class="product-description">

                        ${escapeHTML(
                            shortenText(
                                product.description ||
                                "",
                                100
                            )
                        )}

                    </p>


                    <div class="product-price">

                        ₹${Number(
                            product.price
                        ).toLocaleString(
                            "en-IN"
                        )}

                        <span>
                            /
                            ${escapeHTML(
                                product.unit ||
                                "unit"
                            )}
                        </span>

                    </div>


                    <p class="product-info">

                        📦 Quantity:
                        ${escapeHTML(
                            product.quantity ??
                            0
                        )}
                        ${escapeHTML(
                            product.unit ||
                            ""
                        )}

                    </p>


                    <p class="product-info">

                        📍
                        ${escapeHTML(
                            product.location ||
                            "Location unavailable"
                        )}

                    </p>


                    <div
                        class="
                            product-status
                            ${
                                isAvailable
                                    ? "status-available"
                                    : "status-unavailable"
                            }
                        "
                    >

                        ${
                            isAvailable
                                ? "🟢"
                                : "🔴"
                        }

                        ${escapeHTML(
                            status
                        )}

                    </div>


                    <div class="product-actions">

                        <button
                            type="button"
                            class="
                                product-action-btn
                                view-btn
                            "
                            data-action="view"
                            data-id="${product.id}"
                        >

                            👁️ View

                        </button>


                        <button
                            type="button"
                            class="
                                product-action-btn
                                edit-btn
                            "
                            data-action="edit"
                            data-id="${product.id}"
                        >

                            ✏️ Edit

                        </button>


                        <button
                            type="button"
                            class="
                                product-action-btn
                                delete-btn
                            "
                            data-action="delete"
                            data-id="${product.id}"
                        >

                            🗑️ Delete Listing

                        </button>

                    </div>

                </div>

            `;


            productsContainer.appendChild(
                card
            );

        }
    );


    // ======================================
    // ACTION BUTTONS
    // ======================================

    productsContainer
        .querySelectorAll(
            "[data-action]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const action =
                            button.dataset.action;


                        const productId =
                            button.dataset.id;


                        if (
                            action ===
                            "view"
                        ) {

                            viewProduct(
                                productId
                            );

                        }


                        else if (
                            action ===
                            "edit"
                        ) {

                            openEditModal(
                                productId
                            );

                        }


                        else if (
                            action ===
                            "delete"
                        ) {

                            deleteProduct(
                                productId
                            );

                        }

                    }
                );

            }
        );

}


// ==========================================
// VIEW PRODUCT
// ==========================================

function viewProduct(
    productId
) {

    const product =
        listings.find(
            item =>
                String(item.id) ===
                String(productId)
        );


    if (!product) {

        alert(
            "❌ Product not found."
        );

        return;

    }


    // Store ID for product-details.js

    localStorage.setItem(
        "selectedProductId",
        product.id
    );


    window.location.href =
        "product-details.html";

}


// ==========================================
// OPEN EDIT MODAL
// ==========================================

function openEditModal(
    productId
) {

    const product =
        listings.find(
            item =>
                String(item.id) ===
                String(productId)
        );


    if (!product) {

        alert(
            "❌ Product not found."
        );

        return;

    }


    if (!isCurrentUserOwner(product)) {

        alert(
            "❌ You can only edit your own products."
        );

        return;

    }


    editProductId.value =
        product.id;


    editProductName.value =
        product.productName ||
        "";


    editCategory.value =
        product.category ||
        "Other";


    editPrice.value =
        product.price ??
        0;


    editQuantity.value =
        product.quantity ??
        0;


    editUnit.value =
        product.unit ||
        "";


    editLocation.value =
        product.location ||
        "";


    editDescription.value =
        product.description ||
        "";


    editModal.hidden =
        false;

}


// ==========================================
// CLOSE EDIT MODAL
// ==========================================

function closeEditModal() {

    if (!editModal) {

        return;

    }


    editModal.hidden =
        true;


    if (editProductForm) {

        editProductForm.reset();

    }

}


// ==========================================
// SAVE EDITED PRODUCT
// ==========================================

if (editProductForm) {

    editProductForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const productId =
                editProductId.value;


            const productIndex =
                listings.findIndex(
                    item =>
                        String(item.id) ===
                        String(productId)
                );


            if (
                productIndex ===
                -1
            ) {

                alert(
                    "❌ Product not found."
                );

                return;

            }


            const product =
                listings[
                    productIndex
                ];


            // ==================================
            // SECURITY CHECK
            // ==================================

            if (
                !isCurrentUserOwner(
                    product
                )
            ) {

                alert(
                    "❌ You can only edit your own products."
                );

                closeEditModal();

                return;

            }


            // ==================================
            // UPDATE EXISTING LISTING
            // ==================================

            product.productName =
                editProductName.value.trim();


            product.category =
                editCategory.value;


            product.price =
                Number(
                    editPrice.value
                );


            product.quantity =
                Number(
                    editQuantity.value
                );


            product.unit =
                editUnit.value.trim();


            product.location =
                editLocation.value.trim();


            product.description =
                editDescription.value.trim();


            // ==================================
            // SAVE
            // ==================================

            listings[
                productIndex
            ] = product;


            localStorage.setItem(
                "marketplaceListings",
                JSON.stringify(
                    listings
                )
            );


            closeEditModal();


            displayProducts();


            alert(
                "✅ Product listing updated successfully."
            );

        }
    );

}


// ==========================================
// DELETE PRODUCT
// ==========================================

function deleteProduct(
    productId
) {

    const product =
        listings.find(
            item =>
                String(item.id) ===
                String(productId)
        );


    if (!product) {

        alert(
            "❌ Product not found."
        );

        return;

    }


    // ======================================
    // SECURITY CHECK
    // ======================================

    if (
        !isCurrentUserOwner(
            product
        )
    ) {

        alert(
            "❌ You can only delete your own products."
        );

        return;

    }


    const confirmation =
        confirm(
            `Are you sure you want to delete "${product.productName}"?`
        );


    if (!confirmation) {

        return;

    }


    listings =
        listings.filter(
            item =>
                String(item.id) !==
                String(productId)
        );


    localStorage.setItem(
        "marketplaceListings",
        JSON.stringify(
            listings
        )
    );


    displayProducts();


    alert(
        "🗑️ Product listing deleted successfully."
    );

}


// ==========================================
// OWNERSHIP CHECK
// ==========================================

function isCurrentUserOwner(
    product
) {

    if (!currentUser) {

        return false;

    }


    const idMatch =
        product.ownerId &&
        currentUser.id &&
        String(
            product.ownerId
        ) ===
        String(
            currentUser.id
        );


    const emailMatch =
        product.ownerEmail &&
        currentUser.email &&
        String(
            product.ownerEmail
        ).toLowerCase() ===
        String(
            currentUser.email
        ).toLowerCase();


    return (
        idMatch ||
        emailMatch
    );

}


// ==========================================
// SEARCH
// ==========================================

if (productSearch) {

    productSearch.addEventListener(
        "input",
        displayProducts
    );

}


// ==========================================
// CATEGORY FILTER
// ==========================================

if (categoryFilter) {

    categoryFilter.addEventListener(
        "change",
        displayProducts
    );

}


// ==========================================
// CLEAR FILTERS
// ==========================================

if (clearFiltersBtn) {

    clearFiltersBtn.addEventListener(
        "click",
        () => {

            if (productSearch) {

                productSearch.value =
                    "";

            }


            if (categoryFilter) {

                categoryFilter.value =
                    "All";

            }


            displayProducts();

        }
    );

}


// ==========================================
// MODAL BUTTONS
// ==========================================

if (closeModalBtn) {

    closeModalBtn.addEventListener(
        "click",
        closeEditModal
    );

}


if (cancelEditBtn) {

    cancelEditBtn.addEventListener(
        "click",
        closeEditModal
    );

}


// ==========================================
// CLOSE MODAL BY CLICKING OUTSIDE
// ==========================================

if (editModal) {

    editModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                editModal
            ) {

                closeEditModal();

            }

        }
    );

}


// ==========================================
// ESCAPE KEY
// ==========================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape" &&
            editModal &&
            !editModal.hidden
        ) {

            closeEditModal();

        }

    }
);


// ==========================================
// HELPER
// ==========================================

function shortenText(
    text,
    maxLength
) {

    const value =
        String(
            text ??
            ""
        );


    if (
        value.length <=
        maxLength
    ) {

        return value;

    }


    return (
        value.substring(
            0,
            maxLength
        ) +
        "..."
    );

}


// ==========================================
// SECURITY
// ==========================================

function escapeHTML(
    value
) {

    return String(
        value ??
        ""
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

displayProducts();


console.log(
    "✅ Seller Product Management loaded successfully."
);