const express =require('express');
const app =express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
const myurl="http://20.244.56.144/train/auth" //API for authorization
const myurl2="http://20.244.56.144/train/trains" //API to get trains data
const initialfetch=async()=>{
const  data=await fetch(myurl, {
        method: "POST",
        body: JSON.stringify({
            companyName: "Train Central",
            clientID: "d4915418-69c5-4b6b-aad7-22c270033cf7",
            clientSecret: "BoAHPfOaeFJYzJJZ",
            ownerName: "Ram",
            ownerEmail: "testing@gmail.com",
            rollNo:"20VE1A6752"

        })
    })
    const myData= await data.json();
    return myData
}
const trainDetails= async(bearer)=>{
    const res=await fetch(myurl2,{
        method:"GET",
        headers: {
            'Content-Type': 'application/json',
            "Authorization": "Bearer " + bearer
        }

    })
    const trainData=await res.json();
    const data=filterTrains(trainData);
    return trainData


}

const filterTrains=async(allTrains)=>{
    const presentHour= new Date().getHours()
    const presentMinutes=new Date().getMinutes()
    const filteredData=allTrains.filter(train => {
    const hoursDifference = train.departureTime.Hours -presentHour ;
    const minutesDifference = train.departureTime.Minutes -presentMinutes;
    return hoursDifference < 12 && (hoursDifference === 0 ? minutesDifference > 30 :true);});
    console.log(filteredData)
    return filteredData
}

const sortedTrains = (trains) => {
    const t1 = trains.sort((firstTrain, secondTrain) => firstTrain.price.sleeper - secondTrain.price.sleeper)
    const t2= t1.sort((firstTrain, secondTrain) => secondTrain.seatsAvailable.sleeper - firstTrain.seatsAvailable.sleeper)
    const t3 = t2.sort((firstTrain, secondTrain) => new Date(0, 0, 0, firstTrain.departureTime.Hours, firstTrain.departureTime.Minutes + firstTrain.delayedBy, firstTrain.departureTime.Seconds, 0) - new Date(0, 0, 0, secondTrain.departureTime.Hours, secondTrain.departureTime.Minutes + secondTrain.delayedBy, secondTrain.departureTime.Seconds, 0));
    return t3
}
const singleTrain= async({id,bearer})=>{
    const res=await fetch(`http://20.244.56.144/train/trains/${id}`,{
        method:"GET",
        headers: {
            'Content-Type': 'application/json',
            "Authorization": "Bearer " + bearer
        }

    })
    const train=await res.json();
    return train

}
app.get('/', async (request,response)=>{
    const data = await initialfetch();
    const {access_token}=data
    const data2=await trainDetails(access_token)
    const data3= await filterTrains(data2)
    const data4= await sortedTrains(data3)
    response.send(data4)

})
app.get('/train/:id',async (request,response)=>{
    const id=request.params.id;
    const data = await initialfetch();
    const {access_token}=data
    console.log(access_token)
    const oneTrain = await singleTrain({id,access_token});
    response.send(oneTrain);
})
app.listen(4000,()=>{
    console.log("hello")
})