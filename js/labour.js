/* ==========================================
   KISAN CONNECT
   labour.js

   Labour Enlistment System
========================================== */


// ==========================================
// GET CURRENT USER
// ==========================================

const currentUser =
    JSON.parse(
        localStorage.getItem("currentUser")
    );


// ==========================================
// PHONE NUMBER
// Load phone number from account
// ==========================================

const labourPhone =
    document.getElementById("labourPhone");

if (labourPhone && currentUser) {

    labourPhone.value =
        currentUser.phone || "";

}


// ==========================================
// LOGIN CHECK
// ==========================================

if (!currentUser) {

    window.location.href =
        "login.html";

}


// ==========================================
// LABOURER ACCESS ONLY
// ==========================================

if (
    currentUser &&
    currentUser.role !== "Labourer"
) {

    if (currentUser.role === "Farmer") {

        window.location.href =
            "farmer-dashboard.html";

    }

    else if (
        currentUser.role === "Seller"
    ) {

        window.location.href =
            "seller-dashboard.html";

    }

}


// ==========================================
// FORM
// ==========================================

const labourForm =
    document.getElementById(
        "labourForm"
    );


if (labourForm) {


    // ======================================
    // LOAD EXISTING PROFILE
    // ======================================

    const profiles =
        JSON.parse(
            localStorage.getItem(
                "labourProfiles"
            )
        ) || [];


    const existingProfile =
        profiles.find(
            profile =>
                profile.email ===
                currentUser.email
        );


    if (existingProfile) {

        document.getElementById(
            "labourName"
        ).value =
            existingProfile.name || "";


        document.getElementById(
            "labourLocation"
        ).value =
            existingProfile.location || "";


        document.getElementById(
            "experience"
        ).value =
            existingProfile.experience || "";


        document.getElementById(
            "expectedPay"
        ).value =
            existingProfile.expectedPay || "";


        document.getElementById(
            "availability"
        ).value =
            existingProfile.availability || "";


        document.getElementById(
            "aboutLabour"
        ).value =
            existingProfile.about || "";


        // ==================================
        // LOAD PHONE NUMBER
        // ==================================

        const existingPhone =
            document.getElementById(
                "labourPhone"
            );

        if (existingPhone) {

            existingPhone.value =
                currentUser.phone || "";

        }


        // ==================================
        // RESTORE SELECTED SKILLS
        // ==================================

        const skillCheckboxes =
            document.querySelectorAll(
                'input[name="skill"]'
            );


        skillCheckboxes.forEach(
            checkbox => {

                if (
                    existingProfile.skills &&
                    existingProfile.skills.includes(
                        checkbox.value
                    )
                ) {

                    checkbox.checked = true;

                }

            }
        );

    }


    // ======================================
    // SAVE PROFILE
    // ======================================

    labourForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            // ==================================
            // GET SELECTED SKILLS
            // ==================================

            const selectedSkills =
                Array.from(
                    document.querySelectorAll(
                        'input[name="skill"]:checked'
                    )
                ).map(
                    checkbox =>
                        checkbox.value
                );


            // ==================================
            // REQUIRE AT LEAST ONE SKILL
            // ==================================

            if (
                selectedSkills.length === 0
            ) {

                alert(
                    "⚠️ Please select at least one skill."
                );

                return;

            }


            // ==================================
            // FORM VALUES
            // ==================================

            const profile = {

                // Unique profile ID
                id:
                    existingProfile
                        ? existingProfile.id
                        : Date.now(),


                // Labourer's name
                name:
                    document
                        .getElementById(
                            "labourName"
                        )
                        .value
                        .trim(),


                // Account email
                email:
                    currentUser.email,


                // ==================================
                // PHONE NUMBER
                // Comes directly from the account
                // ==================================

                phone:
                    currentUser.phone || "",


                // Labourer's location
                location:
                    document
                        .getElementById(
                            "labourLocation"
                        )
                        .value
                        .trim(),


                // Skills
                skills:
                    selectedSkills,


                // Experience
                experience:
                    document
                        .getElementById(
                            "experience"
                        )
                        .value,


                // Expected daily pay
                expectedPay:
                    Number(
                        document
                            .getElementById(
                                "expectedPay"
                            )
                            .value
                    ),


                // Availability
                availability:
                    document
                        .getElementById(
                            "availability"
                        )
                        .value,


                // About the labourer
                about:
                    document
                        .getElementById(
                            "aboutLabour"
                        )
                        .value
                        .trim(),


                // Email verification status
                emailVerified:
                    false,


                // Creation date
                createdAt:
                    existingProfile
                        ? existingProfile.createdAt
                        : new Date().toISOString(),


                // Last update
                updatedAt:
                    new Date().toISOString()

            };


            // ==================================
            // SAVE PROFILE
            // ==================================

            let profiles =
                JSON.parse(
                    localStorage.getItem(
                        "labourProfiles"
                    )
                ) || [];


            // Remove old profile if editing

            profiles =
                profiles.filter(
                    item =>
                        item.email !==
                        currentUser.email
                );


            // Add updated profile

            profiles.push(profile);


            // Save to localStorage

            localStorage.setItem(
                "labourProfiles",
                JSON.stringify(
                    profiles
                )
            );


            // ==================================
            // SUCCESS
            // ==================================

            alert(
                "✅ Labour profile saved successfully!"
            );


            window.location.href =
                "labour-dashboard.html";

        }
    );

}


console.log(
    "✅ Labour Enlistment System Loaded Successfully!"
);