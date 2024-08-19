import mongoose,{Schema} from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

const commentSchema=new Schema({
 content:{
    type:String,
    required:true
    },
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})
commentSchema.plugin(mongooseAggregatePaginate)//gives ability to paginate helps in giving the range from where to where we  need to show the video
const Comment=mongoose.model("Comment",commentSchema)
export default Comment