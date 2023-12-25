import mongoose from "mongoose";


const file = new mongoose.Schema({
    // file:{
    //     type:String,
    //     required:true
        
    // },
    fileName:{
        type:String,
        required:true,
        unique:true,
    },
    folderId:{
        type:String

    },
    iv:{
        type:String

    },
    encrypt:{
        type:String

    },
    key:{
        type:String

    }

},{
    timestamps:true
})


export const File = mongoose.model("Files",file)