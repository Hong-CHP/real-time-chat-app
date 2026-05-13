import PhotoAlbum from "react-photo-album"
import { mediaPost } from "../content/media"
import Lightbox from "yet-another-react-lightbox"
import { useState } from "react"
import ReactPlayer from "react-player";

function Media() {
	const [index, setIndex] = useState(-1)
	const photos = mediaPost.filter(post=>post.type === "gallery").flatMap(post=>post.images)
	return (
		<div>
			<h2>Last works...</h2>
			<section>
				<h3>Photos</h3>
				<PhotoAlbum layout="masonry" photos={photos} onClick={({index})=>setIndex(index)} />
				<Lightbox 
					open={index >=0} 
					close={()=>setIndex(-1)}
					index={index}
					slides={photos} />
			</section>

			<section>
				<h3>Videos</h3>
				{mediaPost.filter(post=>post.type === "video").map(post=>(
					<div key={post.id}>
						<h4>{post.title}</h4>
						<p>{post.description}</p>
						<ReactPlayer src={post.video_url} controls width="100%" height="300px" />
					</div>
				))}
			</section>
		</div>
	)
}

export default Media