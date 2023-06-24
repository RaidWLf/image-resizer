const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron"); // added electron to the project
const path = require("path");
const os = require("os");
const fs = require("fs");
const resizeImg = require("resize-img");

const isMac = process.platform === "darwin";

const isDev = process.env.NODE_ENV === "development";

// npx electronmon .

let mainWindow;

//main window function
function createMainWindow() {
  // initialized new window
  mainWindow = new BrowserWindow({
    title: "Image Resizer", // title of the window
    width: isDev ? 1000 : 400, // fixed width of 800px at start
    height: 500, //fixed height of 600px at start
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // open devtools window in dev environment
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // load index.html file from renderer
  mainWindow.loadFile(path.join(__dirname, "./renderer/index.html"));
}

//About Window Function
function createAboutWindow() {
  // initialized new window
  const aboutWindow = new BrowserWindow({
    title: "About Image Resizer", // title of the window
    width: 300, // fixed width of 800px at start
    height: 300, //fixed height of 600px at start
  });

  // load index.html file from renderer
  aboutWindow.loadFile(path.join(__dirname, "./renderer/about.html"));
}

app.whenReady().then(() => {
  // when app is ready then
  createMainWindow(); // create window

  // build main menu for the app window
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  // when app is activated but no window is present
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow(); // create window
    }
  });
});

// Menu List or Template
const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  {
    role: "fileMenu",
  },
  ...(!isMac
    ? [
        {
          label: "Help",
          submenu: [{ label: "About", click: createAboutWindow }],
        },
      ]
    : []),
];

ipcMain.on("imageResize", (e, options) => {
  options.dest = path.join(os.homedir(), "imageResizer");
  resizeImage(options);
});

const resizeImage = async ({ imgPath, width, height, dest }) => {
  try {
    const newPath = await resizeImg(fs.readFileSync(imgPath), {
      width: +width,
      height: +height,
    });
    const filename = path.basename(imgPath);

    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }

    fs.writeFileSync(path.join(dest, filename), newPath);
    shell.openPath(dest);

    mainWindow.webContents.send("imageDone");
  } catch (error) {
    console.log(error);
  }
};

// when all windows are closed
app.on("window-all-closed", () => {
  // and platform is not darwin
  if (!isMac) {
    app.quit(); // quit the app process
  }
});
