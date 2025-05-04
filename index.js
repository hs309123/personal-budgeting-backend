const app = require("./app");

const port = process.env.PORT || 8000;
// Start the server
app.listen(port, () => {
    console.info(`Server is live at http://localhost:${port}`);
});