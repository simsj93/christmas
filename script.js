

const NOTES = {
    2: {
        title: "i",
        text: "When I first saw you it was on a computer screen: during covid and over Zoom. Embarrassingly, I would pin your webcam window and study your eyes while Jackie talked. I felt like I knew you.  It was as though a future meaning too immense for time was spilling back into the present. We hadn’t spoken yet. \nThe Japanese call this Koi No Yokan. "
    },
    4: {
        title: "Pattern",
        text: "Every box asks for more.\nYou keep clicking anyway."
    },
    6: {
        title: "Momentum",
        text: "Effort compounds.\nSo does commitment."
    },
    // add more as needed
};

const boxes = Array.from({ length: 20 }, (_, i) => {
    let reward;

    if (i === 0) {
        reward = { type: "upgrade" };
    } else if ((i + 1) % 2 === 0) {
        reward = { type: "note", id: i + 1 };
    } else {
        reward = { type: "collectible" };
    }

    return { clicksRequired: Math.ceil(5 * Math.pow(2.5, i)), reward };
});


let currentIndex = 0;
let clicks = 0;
let totalClicks = 0;
let totalClicksPerClick = 1; // permanent +1 upgrades
let clickPower = 1; // base click power
let doubleActive = false;

let addClickValueCost = 1;
let doubleClickCost = 1;

const game = document.getElementById("game");
const overlay = document.getElementById("reward-overlay");
const rewardContent = document.getElementById("reward-content");
const collection = document.getElementById("collection");
const endScreen = document.getElementById("end-screen");
const clickCounter = document.getElementById("click-counter");
const upgradePanel = document.getElementById("upgrade-panel");

let centerBox, rightBox;

function createBox(className) {
    const box = document.createElement("div");
    box.className = `box ${className}`; // starts invisible (opacity:0)

    const wrapper = document.createElement("div");
    wrapper.className = "chest-wrapper";

    const img = document.createElement("img");
    img.src = "./assets/chest.png";
    img.className = "chest";
    img.alt = "Box";

    const fill = document.createElement("div");
    fill.className = "fill";

    wrapper.appendChild(fill);
    wrapper.appendChild(img);
    box.appendChild(wrapper);
    game.appendChild(box);

    // Force a reflow so the browser registers opacity:0
    void box.offsetWidth;

    // Add visible class after reflow to trigger transition
    setTimeout(() => {
        box.classList.add("visible");
    }, 50); // slight delay ensures transition works

    return box;
}

function setupBoxes() {
    centerBox = createBox("center");
    rightBox = createBox("right");
    centerBox.addEventListener("click", onClickBox);
}

function onClickBox() {
    const effectiveClick = totalClicksPerClick * clickPower;
    clicks += effectiveClick;
    totalClicks += effectiveClick;
    updateClickCounter();

    const required = boxes[currentIndex].clicksRequired;
    const progress = Math.min(clicks / required, 1);
    centerBox.querySelector(".fill").style.height = `${progress * 100}%`;

    if (progress >= 1) {
        centerBox.classList.add("complete");
        centerBox.removeEventListener("click", onClickBox);
        setTimeout(() => {
            if (currentIndex === 0) showUpgradePanel();
            else openBox();
        }, 400);
    }
}

function updateClickCounter() {
    clickCounter.textContent = `Bank: ${Math.floor(totalClicks)}`;
}

function openBox() {
    centerBox.classList.add("open");
    setTimeout(showReward, 400);
}

function showReward() {
    const reward = boxes[currentIndex].reward;
    overlay.classList.add("visible");
    rewardContent.innerHTML = "";

    if (reward.type === "note") {
        showNoteReward(reward.id);
    }

    if (reward.type === "collectible") {
        showCollectibleReward();
    }

    if (currentIndex === 0) {
        const firstBoxMessage = document.createElement("p");
        firstBoxMessage.textContent = "You unlocked some upgrade options, but each box will require more clicks than the last. Do you want to open them all?";
        firstBoxMessage.style.fontWeight = "bold";
        firstBoxMessage.style.marginBottom = "0.5rem"; // spacing above Continue button
        rewardContent.appendChild(firstBoxMessage);
    }

    const btn = document.createElement("button");
    btn.className = "button-39";
    btn.textContent = "Continue";
    btn.onclick = closeReward;
    rewardContent.appendChild(btn);
}

function showNoteReward(noteId) {
    const note = NOTES[noteId];

    const wrapper = document.createElement("div");
    wrapper.className = "note-reveal";

    const title = document.createElement("h2");
    title.textContent = note?.title ?? "Note";

    const text = document.createElement("p");
    text.textContent = note?.text ?? "The note is unreadable.";

    wrapper.appendChild(title);
    wrapper.appendChild(text);
    rewardContent.appendChild(wrapper);
}

function showCollectibleReward() {
    const item = document.createElement("div");
    item.className = "collectible";
    collection.appendChild(item);

    const preview = document.createElement("div");
    preview.className = "collectible";
    preview.style.width = "96px";
    preview.style.height = "96px";
    preview.style.margin = "0 auto 1rem";

    rewardContent.appendChild(preview);
}



function closeReward() {
    overlay.classList.remove("visible");
    transitionBoxes();
}

function transitionBoxes() {
    if (currentIndex >= boxes.length) {
        clickCounter.style.display = "none";
        upgradePanel.style.display = "none";
        endScreen.classList.add("visible");
        return;
    }

    centerBox.style.left = "-220px";
    rightBox.classList.replace("right", "center");

    setTimeout(() => {
        game.removeChild(centerBox);
        centerBox = rightBox;
        clicks = 0;
        centerBox.querySelector(".fill").style.height = "0%";
        centerBox.classList.remove("open", "complete");
        centerBox.addEventListener("click", onClickBox);

        currentIndex++;
        if (currentIndex >= boxes.length) {
            endScreen.classList.add("visible");
            return;
        }
        rightBox = createBox("right");
    }, 700);
}

function showUpgradePanel() {
    upgradePanel.style.display = "flex";

    // +1 per click button
    const addBtn = document.createElement("button");
    addBtn.className = "button-39";

    // Double click 10s button
    const doubleBtn = document.createElement("button");
    doubleBtn.className = "button-39";

    // Status span inside double-click button
    const doubleStatus = document.createElement("span");
    doubleStatus.style.marginLeft = "8px";
    doubleStatus.style.fontSize = "0.8rem";
    doubleStatus.style.color = "#007ACC";
    doubleStatus.textContent = "(Inactive)";
    doubleBtn.appendChild(document.createTextNode("Double click 10s ")); // main text
    doubleBtn.appendChild(doubleStatus); // status

    // Auto-click button (optional if you add it later)
    const autoClickBtn = document.createElement("button");
    autoClickBtn.className = "button-39";

    // Costs
    let addClickValueCost = 1;
    let doubleClickCost = 1000;
    let autoClickCost = 2;

    function updateButtons() {
        addBtn.textContent = `+1 per click (Cost: ${addClickValueCost})`;

        // update double click button text
        doubleBtn.firstChild.textContent = `Double click 10s (Cost: ${doubleClickCost})`;

        // only blue when active
        if (doubleActive) {
            doubleStatus.style.color = "#007ACC"; // blue
            doubleStatus.textContent = "(Active)";
        } else {
            doubleStatus.style.color = "#333"; // neutral/gray
            doubleStatus.textContent = "(Inactive)";
        }

        autoClickBtn.textContent = `Auto-click (Cost: ${autoClickCost})`;
    }

    updateButtons();

    addBtn.onclick = () => {
        if (totalClicks >= addClickValueCost) {
            totalClicks -= addClickValueCost;
            totalClicksPerClick += 1;
            addClickValueCost *= Math.ceil(1.5); // double cost each time
            updateClickCounter();
            updateButtons();
        }
    };

    doubleBtn.onclick = () => {
        if (totalClicks >= doubleClickCost && !doubleActive) {
            totalClicks -= doubleClickCost;
            clickPower *= 2;
            doubleActive = true;
            doubleClickCost = 1000; // double the cost each time
            updateClickCounter();
            updateButtons();

            setTimeout(() => {
                clickPower /= 2;
                doubleActive = false;
                updateButtons();
            }, 10000);
        }
    };

    upgradePanel.appendChild(addBtn);
    upgradePanel.appendChild(doubleBtn);
    upgradePanel.appendChild(autoClickBtn); // optional

    openBox(); // continue after first box
}



const introOverlay = document.getElementById("intro-overlay");
setTimeout(() => {
    introOverlay.style.transition = "opacity 1s ease";
    introOverlay.style.opacity = 0;

    setTimeout(() => {
        introOverlay.style.display = "none";
        setupBoxes();
    }, 1000);

}, 1500);
// --- Intro fade ---

