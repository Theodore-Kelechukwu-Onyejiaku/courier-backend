const mongoose = require("mongoose");


const courierSchema = mongoose.Schema({
    r_first_name : {
        type: String,
    },
    r_last_name: {
        type: String,
    },
    r_address: {
        type: String,
    },
    r_phone: {
        type: String,
    },
    r_email: {
        type: String,
    },
    r_state: {
        type: String
    },
    s_first_name : {
        type: String,
    },
    s_last_name: {
        type: String,
    },
    s_address: {
        type: String,
    },
    s_phone: {
        type: String,
    },
    s_email: {
        type: String,
    },
    s_state: {
        type: String
    },
    p_number: {
        type: String
    },
    p_destination:{
        type: String
    },
    p_weight: {
        type: String
    },
    p_mode: {
        type: String
    },
    p_items: {
        type: String
    },
    p_payment: {
        type: String
    },
    p_delivery_date:{
        type: String
    },
    p_departure_date:{
        type: String
    },
    p_departure_time:{
        type: String
    },
    p_id:{
        type: String
    },
    p_pickup_time:{
        type: String
    },
    p_pickup_date:{
        type: String
    },
    p_arrived: {
        type: String
    },
    p_location: {
        type: String
    },
    p_comment:{
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Courier', courierSchema);