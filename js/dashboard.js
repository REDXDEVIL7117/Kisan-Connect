const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser) {

    window.location.href = "login.html";

}

document.getElementById("welcomeText").innerHTML =
`Welcome, ${currentUser.name}! 👋`;

document.getElementById("logoutBtn").addEventListener("click", () => {

    localStorage.removeItem("currentUser");

    alert("Logged Out Successfully");

    window.location.href = "login.html";

});