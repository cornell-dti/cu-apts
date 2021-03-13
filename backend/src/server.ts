import app from './app'

const port = process.env.PORT || 8080; 

// eslint-disable-next-line
app.listen(port, () => console.log(`Server running on port: ${port}`));
