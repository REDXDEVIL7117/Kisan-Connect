/* ==========================================
   KISAN CONNECT
   jobs.js
   Job + Labour Connection System
========================================== */


// ==========================================
// CURRENT USER
// ==========================================

const currentUser =
    JSON.parse(localStorage.getItem("currentUser"));


// ==========================================
// LOGIN CHECK
// ==========================================

if (!currentUser) {

    window.location.href = "login.html";

}


// ==========================================
// SAFE HTML
// ==========================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================
// GET LABOUR PROFILE
// ==========================================

function getLabourProfile(email) {

    const profiles =
        JSON.parse(
            localStorage.getItem("labourProfiles")
        ) || [];

    return profiles.find(
        profile => profile.email === email
    );

}


// ==========================================
// POST JOB
// FARMER + SELLER ONLY
// ==========================================

const jobForm =
    document.getElementById("jobForm");


if (jobForm) {

    // Only Farmers and Sellers may post jobs

    if (
        !currentUser ||
        (
            currentUser.role !== "Farmer" &&
            currentUser.role !== "Seller"
        )
    ) {

        alert(
            "❌ Only Farmers and Sellers can post jobs."
        );

        window.location.href =
            "login.html";

    }


    jobForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const title =
                document
                    .getElementById("title")
                    .value
                    .trim();

            const location =
                document
                    .getElementById("location")
                    .value
                    .trim();

            const workers =
                document
                    .getElementById("workers")
                    .value;

            const salary =
                document
                    .getElementById("salary")
                    .value;

            const date =
                document
                    .getElementById("date")
                    .value;


            let jobs =
                JSON.parse(
                    localStorage.getItem("jobs")
                ) || [];


            const job = {

                id: Date.now(),

                title: title,

                location: location,

                workers: workers,

                salary: salary,

                date: date,

                status: "Open",

                postedBy:
                    currentUser.email,

                postedByName:
                    currentUser.name,

                postedByRole:
                    currentUser.role,

                acceptedBy: null,

                acceptedByName: null,

                acceptedByRole: null,

                acceptedLabourProfile: null

            };


            jobs.push(job);


            localStorage.setItem(
                "jobs",
                JSON.stringify(jobs)
            );


            alert(
                "✅ Job posted successfully!"
            );


            // Send poster back to their dashboard

            if (currentUser.role === "Farmer") {

                window.location.href =
                    "farmer-dashboard.html";

            }

            else {

                window.location.href =
                    "seller-dashboard.html";

            }

        }
    );

}


// ==========================================
// MY JOBS
// FARMER / SELLER
// ==========================================

const jobsContainer =
    document.getElementById("jobsContainer");


if (jobsContainer) {

    // Only Farmers and Sellers can view
    // their posted jobs

    if (
        !currentUser ||
        (
            currentUser.role !== "Farmer" &&
            currentUser.role !== "Seller"
        )
    ) {

        alert(
            "❌ This page is only for Farmers and Sellers."
        );

        window.location.href =
            "login.html";

    }


    const jobs =
        JSON.parse(
            localStorage.getItem("jobs")
        ) || [];


    const myJobs =
        jobs.filter(
            job =>
                job.postedBy ===
                currentUser.email
        );


    if (myJobs.length === 0) {

        jobsContainer.innerHTML = `

            <div class="no-jobs">

                <h2>
                    No Jobs Posted Yet 🌱
                </h2>

                <p>
                    You haven't posted any labour
                    jobs yet.
                </p>

            </div>

        `;

    }

    else {

        myJobs.forEach(job => {

            const jobCard =
                document.createElement("div");

            jobCard.className =
                "job-card";


            // ==================================
            // BASIC JOB INFORMATION
            // ==================================

            let acceptedLabourHTML = "";


            // ==================================
            // ACCEPTED LABOUR PROFILE
            // ==================================

            if (
                job.status === "Accepted" &&
                job.acceptedLabourProfile
            ) {

                const labour =
                    job.acceptedLabourProfile;


                const skills =
                    labour.skills &&
                    labour.skills.length > 0

                        ? labour.skills
                            .map(
                                skill =>
                                    `<span>${escapeHTML(skill)}</span>`
                            )
                            .join(" ")

                        : "Not provided";


                acceptedLabourHTML = `

                    <div class="accepted-labour">

                        <h3>
                            👷 Labourer Accepted This Job
                        </h3>


                        <div class="labour-profile-box">

                            <h4>
                                ${escapeHTML(
                                    labour.name
                                )}
                            </h4>


                            <p>
                                📞 <strong>Phone:</strong>
                                ${escapeHTML(
                                    labour.phone ||
                                    "Not available"
                                )}
                            </p>


                            <p>
                                📧 <strong>Email:</strong>
                                ${escapeHTML(
                                    labour.email
                                )}
                            </p>


                            <p>
                                📍 <strong>Location:</strong>
                                ${escapeHTML(
                                    labour.location
                                )}
                            </p>


                            <p>
                                💼 <strong>Experience:</strong>
                                ${escapeHTML(
                                    labour.experience
                                )}
                            </p>


                            <p>
                                💰 <strong>Expected Pay:</strong>
                                ₹${Number(
                                    labour.expectedPay || 0
                                ).toLocaleString("en-IN")}/day
                            </p>


                            <p>
                                🟢 <strong>Availability:</strong>
                                ${escapeHTML(
                                    labour.availability
                                )}
                            </p>


                            <div class="labour-skills">

                                <strong>
                                    🛠️ Skills:
                                </strong>

                                <div class="skill-list">
                                    ${skills}
                                </div>

                            </div>


                            <p class="labour-about">

                                📝 <strong>About:</strong><br>

                                ${escapeHTML(
                                    labour.about ||
                                    "No description provided."
                                )}

                            </p>

                        </div>


                        <div class="accepted-job-summary">

                            <h4>
                                📋 Accepted Job
                            </h4>

                            <p>
                                🌾 <strong>Job:</strong>
                                ${escapeHTML(job.title)}
                            </p>

                            <p>
                                📍 <strong>Location:</strong>
                                ${escapeHTML(job.location)}
                            </p>

                            <p>
                                💰 <strong>Pay:</strong>
                                ₹${Number(
                                    job.salary
                                ).toLocaleString("en-IN")}/day
                            </p>

                            <p>
                                📅 <strong>Start Date:</strong>
                                ${escapeHTML(job.date)}
                            </p>

                        </div>

                    </div>

                `;

            }


            jobCard.innerHTML = `

                <h3>
                    ${escapeHTML(job.title)}
                </h3>


                <span class="job-status">
                    ${escapeHTML(job.status)}
                </span>


                <p>
                    📍 <strong>Location:</strong>
                    ${escapeHTML(job.location)}
                </p>


                <p>
                    👷 <strong>Workers Needed:</strong>
                    ${escapeHTML(job.workers)}
                </p>


                <p>
                    💰 <strong>Pay:</strong>
                    ₹${Number(
                        job.salary
                    ).toLocaleString("en-IN")}/day
                </p>


                <p>
                    📅 <strong>Start Date:</strong>
                    ${escapeHTML(job.date)}
                </p>


                ${acceptedLabourHTML}


                <button
                    class="delete-job"
                    onclick="deleteJob(${job.id})">

                    🗑️ Delete Job

                </button>

            `;


            jobsContainer.appendChild(
                jobCard
            );

        });

    }

}


// ==========================================
// DELETE JOB
// ==========================================

function deleteJob(jobId) {

    const confirmation =
        confirm(
            "Are you sure you want to delete this job?"
        );


    if (!confirmation) {
        return;
    }


    let jobs =
        JSON.parse(
            localStorage.getItem("jobs")
        ) || [];


    jobs =
        jobs.filter(
            job => job.id !== jobId
        );


    localStorage.setItem(
        "jobs",
        JSON.stringify(jobs)
    );


    location.reload();

}


// ==========================================
// VIEW AVAILABLE JOBS
// LABOURERS ONLY
// ==========================================

const availableJobsContainer =
    document.getElementById(
        "availableJobsContainer"
    );


if (availableJobsContainer) {

    if (
        !currentUser ||
        currentUser.role !== "Labourer"
    ) {

        alert(
            "❌ Only Labourers can access available jobs."
        );

        window.location.href =
            "login.html";

    }


    const jobs =
        JSON.parse(
            localStorage.getItem("jobs")
        ) || [];


    const openJobs =
        jobs.filter(
            job => job.status === "Open"
        );


    if (openJobs.length === 0) {

        availableJobsContainer.innerHTML = `

            <div class="no-jobs">

                <div class="empty-icon">
                    👷
                </div>

                <h2>
                    No Jobs Available Right Now 🌱
                </h2>

                <p>
                    There are currently no open
                    labour jobs.
                </p>

            </div>

        `;

    }

    else {

        openJobs.forEach(job => {

            const jobCard =
                document.createElement("div");

            jobCard.className =
                "job-card";


            jobCard.innerHTML = `

                <h3>
                    ${escapeHTML(job.title)}
                </h3>


                <span class="job-status">
                    Open
                </span>


                <p>
                    📍 <strong>Location:</strong>
                    ${escapeHTML(job.location)}
                </p>


                <p>
                    👷 <strong>Workers Needed:</strong>
                    ${escapeHTML(job.workers)}
                </p>


                <p>
                    💰 <strong>Pay:</strong>
                    ₹${Number(
                        job.salary
                    ).toLocaleString("en-IN")}/day
                </p>


                <p>
                    📅 <strong>Start Date:</strong>
                    ${escapeHTML(job.date)}
                </p>


                <p>
                    🏷️ <strong>Posted By:</strong>
                    ${escapeHTML(
                        job.postedByRole ||
                        "User"
                    )}
                </p>


                <button
                    class="dashboard-btn"
                    onclick="acceptJob(${job.id})">

                    ✅ Accept Job

                </button>

            `;


            availableJobsContainer.appendChild(
                jobCard
            );

        });

    }

}


// ==========================================
// ACCEPT JOB
// ==========================================

function acceptJob(jobId) {

    if (!currentUser) {

        window.location.href =
            "login.html";

        return;

    }


    if (
        currentUser.role !== "Labourer"
    ) {

        alert(
            "❌ Only Labourers can accept jobs."
        );

        return;

    }


    let jobs =
        JSON.parse(
            localStorage.getItem("jobs")
        ) || [];


    const job =
        jobs.find(
            item => item.id === jobId
        );


    if (!job) {

        alert(
            "❌ Job could not be found."
        );

        return;

    }


    if (job.status !== "Open") {

        alert(
            "⚠️ This job is no longer available."
        );

        location.reload();

        return;

    }


    const confirmation =
        confirm(
            `Accept "${job.title}" in ${job.location}?`
        );


    if (!confirmation) {
        return;
    }


    // ======================================
    // GET LABOUR PROFILE
    // ======================================

    const labourProfile =
        getLabourProfile(
            currentUser.email
        );


    if (!labourProfile) {

        alert(
            "⚠️ Please complete your Labour Profile before accepting a job."
        );

        window.location.href =
            "enlist-labour.html";

        return;

    }


    // ======================================
    // ADD CONTACT FROM ACCOUNT
    // ======================================

    labourProfile.phone =
        currentUser.phone ||
        labourProfile.phone ||
        "Not available";


    labourProfile.email =
        currentUser.email;


    // ======================================
    // UPDATE JOB
    // ======================================

    job.status =
        "Accepted";


    job.acceptedBy =
        currentUser.email;


    job.acceptedByName =
        currentUser.name;


    job.acceptedByRole =
        currentUser.role;


    // Store a snapshot of the profile
    // at the moment the job was accepted.

    job.acceptedLabourProfile = {

        name:
            labourProfile.name,

        email:
            labourProfile.email,

        phone:
            labourProfile.phone,

        location:
            labourProfile.location,

        skills:
            labourProfile.skills || [],

        experience:
            labourProfile.experience,

        expectedPay:
            labourProfile.expectedPay,

        availability:
            labourProfile.availability,

        about:
            labourProfile.about

    };


    // ======================================
    // SAVE
    // ======================================

    localStorage.setItem(
        "jobs",
        JSON.stringify(jobs)
    );


    alert(
        "✅ Job accepted! The job poster can now see your labour profile and contact details."
    );


    location.reload();

}


// ==========================================
// MY WORK
// ==========================================

const myWorkContainer =
    document.getElementById(
        "myWorkContainer"
    );


if (myWorkContainer) {

    if (
        !currentUser ||
        currentUser.role !== "Labourer"
    ) {

        alert(
            "❌ Only Labourers can access My Work."
        );

        window.location.href =
            "login.html";

    }


    const jobs =
        JSON.parse(
            localStorage.getItem("jobs")
        ) || [];


    const myWork =
        jobs.filter(
            job =>
                job.acceptedBy ===
                currentUser.email
        );


    if (myWork.length === 0) {

        myWorkContainer.innerHTML = `

            <div class="no-jobs">

                <div class="empty-icon">
                    👷
                </div>

                <h2>
                    No Work Yet
                </h2>

                <p>
                    You haven't accepted any jobs yet.
                </p>

                <br>

                <a
                    href="view-jobs.html"
                    class="dashboard-btn">

                    🔎 Find Available Jobs

                </a>

            </div>

        `;

    }

    else {

        myWork.forEach(job => {

            const jobCard =
                document.createElement("div");

            jobCard.className =
                "job-card";


            const labour =
                job.acceptedLabourProfile;


            jobCard.innerHTML = `

                <h3>
                    ${escapeHTML(job.title)}
                </h3>


                <span class="job-status">
                    ${escapeHTML(job.status)}
                </span>


                <p>
                    📍 <strong>Location:</strong>
                    ${escapeHTML(job.location)}
                </p>


                <p>
                    💰 <strong>Pay:</strong>
                    ₹${Number(
                        job.salary
                    ).toLocaleString("en-IN")}/day
                </p>


                <p>
                    📅 <strong>Start Date:</strong>
                    ${escapeHTML(job.date)}
                </p>


                <hr>


                <h3>
                    👷 Your Labour Profile
                </h3>


                ${
                    labour
                    ? `

                        <p>
                            👤 <strong>Name:</strong>
                            ${escapeHTML(
                                labour.name
                            )}
                        </p>

                        <p>
                            📞 <strong>Phone:</strong>
                            ${escapeHTML(
                                labour.phone
                            )}
                        </p>

                        <p>
                            📧 <strong>Email:</strong>
                            ${escapeHTML(
                                labour.email
                            )}
                        </p>

                        <p>
                            📍 <strong>Location:</strong>
                            ${escapeHTML(
                                labour.location
                            )}
                        </p>

                        <p>
                            💼 <strong>Experience:</strong>
                            ${escapeHTML(
                                labour.experience
                            )}
                        </p>

                        <p>
                            💰 <strong>Expected Pay:</strong>
                            ₹${Number(
                                labour.expectedPay || 0
                            ).toLocaleString("en-IN")}/day
                        </p>

                        <p>
                            🟢 <strong>Availability:</strong>
                            ${escapeHTML(
                                labour.availability
                            )}
                        </p>

                        <p>
                            🛠️ <strong>Skills:</strong>
                            ${escapeHTML(
                                (labour.skills || [])
                                    .join(", ")
                            )}
                        </p>

                        <p>
                            📝 <strong>About:</strong>
                            ${escapeHTML(
                                labour.about ||
                                "Not provided."
                            )}
                        </p>

                    `
                    : `
                        <p>
                            Labour profile information
                            is unavailable.
                        </p>
                    `
                }

            `;


            myWorkContainer.appendChild(
                jobCard
            );

        });

    }

}