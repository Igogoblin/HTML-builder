const path = require("path");
const fs = require("fs");
// вводим промисы, чтобы в дальнейшем их не писать уже нельзя :(
// const fsPromises = fs.promises;

// const dirSrc = "./04-copy-directory/files/";
// const dirDest = "./04-copy-directory/files-copy/";
// // используем метод для асинхронного создания каталога fs.mkdir(путь, режим, обратный вызов)
// fsPromises.mkdir(
//   dirDest,
//   {
//     recursive: true,
//   },
//   (err) => {
//     if (err) {
//       console.log(err);
//     }
//   }
// );
// метод для взаимодействия с жестким диском
// fs.readdir(dirSrc, { withFileTypes: true }, function (err, item) {
//   for (let i = 0; i < item.length; i++) {
//     fsPromises.copyFile(
//       dirSrc + "/" + item[i].name,
//       dirDest + "/" + item[i].name
//     );
//   }
// });

const dirCopy = path.join(__dirname, "files-copy");
const dirFiles = path.join(__dirname, "files");

fs.readdir(dirCopy, (err, file) => {
  if (file) {
    file.forEach((el) => {
      fs.unlink(path.join(dirCopy, el), () => {});
    });
  }
});

fs.mkdir(dirCopy, () => {
  console.log("Created folder");
});

fs.readdir(dirFiles, (err, file) => {
  file.forEach((el) => {
    fs.readFile(path.join(__dirname, "files", el), "utf8", (err, data) => {
      fs.copyFile(
        path.join(__dirname, "files", el),
        path.join(__dirname, "files-copy", el),
        () => {}
      );
    });
  });
  console.log("Files copy");
});
