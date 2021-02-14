import { Express } from "express";
import { db } from "./firebase/firebase";
import bodyParser from "body-parser";
import { Faq } from "./firebase/types";

const express = require('express');
const app: Express = express()
const port = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({extended: true}))

app.get("/", async (req,res)=> {
    const snapshot = await db.collection('faqs').get()

    let faqs: Faq[] = [];
    snapshot.forEach(doc => {
        let id = doc.id;
        let data = doc.data();
        let faq: Faq = {
            question: data.question,
            answer: data.answer
        }

        faqs.push(faq)
    });

    res.status(200).send(JSON.stringify(faqs));

})

app.post("/", (req,res)=>{   
    let faq: Faq = {
        question: req.body.question,
        answer: req.body.answer
    }
    db.collection("faqs").add(faq)
    .then(function(docRef) {
        console.log("Document written with ID: ", docRef.id);
        res.send("success")
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
        res.send("error")
    });
})

app.listen(port, () => console.log(`Server running on port: ${port}`))