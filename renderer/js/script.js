const form = document.querySelector("#img-form");
const img = document.querySelector("#img");
const selImg = document.querySelector("#sel-img");
const outputPath = document.querySelector("#output-path");
const filename = document.querySelector("#filename");
const heightInput = document.querySelector("#height");
const widthInput = document.querySelector("#width");
const imgPreview = document.querySelector("#prev-img");

//
function loadImage(e) {
  const file = e.target.files[0];

  if (!isFileImage(file)) {
    alertError("Please select a image file");
    return;
  }

  alertSuccess("Successfully loaded the image");

  // Get Original dimensions and preview image
  const imageSrc = URL.createObjectURL(file);
  const image = new Image();
  image.src = imageSrc;
  imgPreview.src = imageSrc;
  image.onload = function () {
    widthInput.value = this.width;
    heightInput.value = this.height;
  };

  form.style.display = "block";
  selImg.className += " hidden";

  filename.innerText = file.name;

  outputPath.innerText = path.join(os.homedir(), "imageResizer");
}

// make sure that file is image
function isFileImage(file) {
  const fileTypes = ["image/gif", "image/jpeg", "image/png"];
  return file && fileTypes.includes(file["type"]);
}

const alertError = (message) => {
  Toastify.toast({
    text: message,
    duration: 3000,
    close: false,
    style: { background: "red", color: "white", textAlign: "center" },
  });
};
const alertSuccess = (message) => {
  Toastify.toast({
    text: message,
    duration: 3000,
    close: false,
    style: { background: "blue", color: "white", textAlign: "center" },
  });
};

const sendImage = (e) => {
  e.preventDefault();
  const width = widthInput.value;
  const height = heightInput.value;
  const imgPath = img.files[0].path;

  if (width === "" || height === "") {
    alertError("Please input a width and height");
    return;
  }
  if (!img.files[0]) {
    alertError("Please select a image file");
    return;
  }

  ipcRenderer.send("imageResize", { imgPath, width, height });
};

ipcRenderer.on("imageDone", () => {
  alertSuccess(
    `Image resized successfully to ${widthInput.value}x${heightInput.value}`
  );
});
img.addEventListener("change", loadImage);
form.addEventListener("submit", sendImage);
