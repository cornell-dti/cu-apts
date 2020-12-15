import { Express } from "express";
import { db, increment } from "./firebase/firebase";
import bodyParser from "body-parser";
import { Apt, Section, Review } from "./firebase/types";
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

app.get("/apts", async (req,res)=> {
    const snapshot = await db.collection('apts').get()

    let apts: Apt[] = [];
    snapshot.forEach(doc => {
        let id = doc.id;
        let data = doc.data();
        let apt: Apt = {
            apt_id: id,
            address: data.address,
            price: data.price,
            landlord: data.landlord,
            avg_rating: data.avg_rating,
            num_reviews: data.num_reviews,
            num_bd: data.num_bd,
            num_bath: data.num_bath
        }
        console.log(apt);
        apts.push(apt)
    });


    res.status(200).send(JSON.stringify(apts));

})


app.post('/reviews', (req,res) => {
    let today: Date = new Date();
    let dd: string = String(today.getDate()).padStart(2, '0');
    let mm: string = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy: number = today.getFullYear();
    let date = mm + '/' + dd + '/' + yyyy;

    let review : Review = {
        user_id: req.body.user_id,
        apt_id: req.body.apt_id,
        overall_rating: req.body.overall_rating,
        landlord_rating: req.body.landlord_rating,
        review_text: req.body.review_text,
        date: date
    }

    db.collection("reviews").add(review)
    .then(async function(docRef) {
        console.log("Document successfully written!");
        var aptRef = await db.collection("apts").doc(review.apt_id);

        aptRef.update({
            num_reviews: increment
        })
        .then(function() {
            console.log("Document successfully updated!");
            res.status(200).send(JSON.stringify(review))
        })
        .catch(function(error) {
            // The document probably doesn't exist.
            console.error("Error updating document: ", error);
        });

        
    })
    .catch(function(error) {
        console.error("Error writing document: ", error);
    });






})


app.listen(port, () => console.log(`Server running on port: ${port}`))