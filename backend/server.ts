import { Express } from "express";
import { db } from "./firebase/firebase";
import bodyParser from "body-parser";
import { Faq, Section } from "./firebase/types";
import cors from "cors"

const express = require('express');
const app: Express = express()
const port = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({extended: true}))
app.use(cors({
    origin: "http://localhost:3000"
}))

app.get("/", async (req,res)=> {
    const snapshot = await db.collection('faqs').get()

    let faqs: Section[] = [];
    snapshot.forEach(doc => {
        let id = doc.id;
        let data = doc.data();
        let section: Section = {
            headerName: data.headerName,
            faqs: data.faqs
        }
        console.log(section);
        faqs.push(section)
    });


    res.status(200).send(JSON.stringify(faqs));

})



app.listen(port, () => console.log(`Server running on port: ${port}`))