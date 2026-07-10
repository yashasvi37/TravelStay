const express= require("express");
const router = express.Router(); 
const wrapAsync= require("../utils/wrapAsync.js");
const {listingSchema,reviewSchema}=require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");



const validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
      let errMsg=error.details.map((el)=>el.message).join(",");
      throw new ExpressError(400,result.error);
    }else{
      next(); 
    }
  };

//Index Route
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  }));
  
  //new route
  router.get("/new",(req,res)=>{
      res.render("listings/new.ejs");
  }); 
  
  //show route
  router.get("/:id",wrapAsync(async (req,res)=>{
      let {id}=req.params;
      const listing=await Listing.findById(id).populate("reviews");//earlier we were getting object IDs only to get the data related to that object ID we need to use the populate method to show the data of the ID
      res.render("listings/show.ejs",{listing});
  }));

  //create route

  router.post("/", validateListing, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing); // Create a new Listing instance
    await newListing.save(); // Save it to the database
    res.redirect("/listings");
}));


//edit route
router.get("/:id/edit",wrapAsync(async (req,res)=>{
  let {id}=req.params;
  const listing=await Listing.findById(id);
  res.render("listings/edit.ejs",{listing});
}));

//UPDATE ROUTE
router.put("/:id",validateListing,wrapAsync(async (req,res)=>{
if(!req.body.listing){
  throw new ExpressError(400,"Send valid data for listing");
}
  let {id}=req.params;
  await Listing.findByIdAndUpdate(id,{...req.body.listing});
  res.redirect(`/listings/${id}`);
}));

//DELETE ROUTE
router.delete("/:id",wrapAsync(async (req,res)=>{
  let {id}=req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
}));

module.exports = router;