const app = document.getElementById("app");
const colorPicker = document.getElementById("color-picker");

// Function to create the color picker interface
function createColorPicker() {
  const colors = ["red", "green", "blue", "alpha"];
  const container = document.createElement("div");
  container.classList.add("slider-container");

  // Loop to create sliders for red, green, blue, and alpha
  for (let i = 0; i < colors.length; i++) {
    const color = colors[i];
    const label = document.createElement("label");
    const span = document.createElement("span");
    span.innerText = `${color.charAt(0).toUpperCase() + color.slice(1)}: `;

    const slider = document.createElement("input");
    slider.type = "range";
    slider.id = color;
    slider.min = "0";
    slider.max = "255";
    slider.value = color === "alpha" ? "255" : "128";

    label.appendChild(span);
    label.appendChild(slider);
    container.appendChild(label);

    // Event listener to update the circle color when the slider is moved
    slider.addEventListener("input", function () {
      updateCircleColor(mouseCircle);
    });
  }

  // Slider for size adjustment
  const sizeLabel = document.createElement("label");
  const sizeSpan = document.createElement("span");
  sizeSpan.innerText = "Size: ";
  const sizeSlider = document.createElement("input");
  sizeSlider.type = "range";
  sizeSlider.id = "size";
  sizeSlider.min = "5";
  sizeSlider.max = "500";
  sizeSlider.value = "25";
  sizeLabel.appendChild(sizeSpan);
  sizeLabel.appendChild(sizeSlider);
  container.appendChild(sizeLabel);

  // Event listener to update the circle size when the size slider is moved
  sizeSlider.addEventListener("input", function () {
    const logValue = Math.log10(sizeSlider.value);
    const size = Math.pow(10, logValue);
    mouseCircle.style.width = `${size}px`;
    mouseCircle.style.height = `${size}px`;
  });

  colorPicker.appendChild(container);

  // Instructions for hotkeys
  const hotkeyMessage = document.createElement("p");
  hotkeyMessage.innerText =
    "P: Toggle Color Picker\nO: Toggle Outline\nZ: Undo";
  hotkeyMessage.style.marginTop = "0px";
  hotkeyMessage.style.color = "#fff";
  hotkeyMessage.style.fontSize = "30px";
  hotkeyMessage.style.textAlign = "left";
  hotkeyMessage.style.paddingRight = "5px";
  colorPicker.appendChild(hotkeyMessage);
}

createColorPicker();

// Function to create the initial circle
const mouseCircle = createCircle();
app.appendChild(mouseCircle);

function createCircle() {
  const circle = document.createElement("div");
  circle.classList.add("circle");

  const ring = document.createElement("div");
  ring.classList.add("circle-ring");
  ring.classList.add("cursor-ring");
  circle.appendChild(ring);

  circle.style.width = "25px";
  circle.style.height = "25px";
  updateCircleColor(circle);
  return circle;
}

// Function to place a copy of the circle in the container
function placeCircle(container) {
  const copy = mouseCircle.cloneNode(true);
  copy.style.position = "absolute";
  copy.style.top = mouseCircle.style.top;
  copy.style.left = mouseCircle.style.left;
  container.appendChild(copy);

  const cursorRing = copy.querySelector(".cursor-ring");
  cursorRing.style.zIndex = "2";

  const ring = copy.querySelector(".circle-ring");
  if (!container.classList.contains("brush-stroke")) {
    ring.style.display = "block";
  } else {
    ring.style.display = "none";
    copy.style.zIndex = "0";
  }
}

// Function to update the circle's color based on slider values
function updateCircleColor(circle) {
  const red = parseInt(document.getElementById("red").value);
  const green = parseInt(document.getElementById("green").value);
  const blue = parseInt(document.getElementById("blue").value);
  const alpha = parseInt(document.getElementById("alpha").value);
  const color = `rgba(${red}, ${green}, ${blue}, ${alpha / 255})`;
  circle.style.backgroundColor = color;
  colorPicker.style.backgroundColor = color;

  const sumRG = red + green;
  const textColor = sumRG > 400 || alpha < 128 ? "#000" : "#fff";

  const colorPickerElements = document.querySelectorAll(
    "#color-picker, #color-picker *"
  );
  for (let i = 0; i < colorPickerElements.length; i++) {
    colorPickerElements[i].style.color = textColor;
  }
}

let isDrawing = false;
const brushStrokes = [];
let currentStroke;

// Function to start a new stroke container
function startNewStroke() {
  const strokeContainer = document.createElement("div");
  strokeContainer.classList.add("brush-stroke");
  app.appendChild(strokeContainer);
  brushStrokes.push(strokeContainer);
  return strokeContainer;
}

let paintInterval;
// Event handler for pointer down event to start drawing
function handleStart(event) {
  event.preventDefault();
  isDrawing = true;
  currentStroke = startNewStroke();
  placeCircle(currentStroke);
  paintInterval = setInterval(function () {
    if (isDrawing) {
      placeCircle(currentStroke);
    }
  }, 10);
}

// Event handler for pointer up event to stop drawing
function handleEnd(event) {
  event.preventDefault();
  isDrawing = false;
  clearInterval(paintInterval);
  setTimeout(function () {
    updateCircleColor(mouseCircle);
  }, 0);
}

// Event handler for pointer leave event to stop drawing
function handlePointerLeave(event) {
  isDrawing = false;
  clearInterval(paintInterval);
}

// Function to undo the last brush stroke
function undoLastBrushStroke() {
  if (brushStrokes.length > 0) {
    const lastStroke = brushStrokes.pop();
    app.removeChild(lastStroke);
  }
}

// Event listener for keydown events to handle hotkeys
document.addEventListener("keydown", function (event) {
  if (event.key === "p") {
    colorPicker.style.display =
      colorPicker.style.display === "none" ? "flex" : "none";
  } else if (event.key === "z") {
    undoLastBrushStroke();
  } else if (event.key === "o") {
    const circle = document.querySelector(".circle");
    circle.classList.toggle("hide-ring");
  }
});

// Event handler for pointer move event to move the circle with the cursor
function handleMove(event) {
  event.preventDefault();
  const size = mouseCircle.offsetWidth / 2;
  mouseCircle.style.top = `${event.clientY - size}px`;
  mouseCircle.style.left = `${event.clientX - size}px`;
}

// Add event listeners to the app for drawing actions
app.addEventListener("pointerdown", handleStart);
app.addEventListener("pointerup", handleEnd);
app.addEventListener("pointermove", handleMove);

// Add event listener to the document for pointer leave event to stop drawing
document.addEventListener("pointerleave", handlePointerLeave);
