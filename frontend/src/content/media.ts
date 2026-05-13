export const mediaPost = [
	{
		id: "gallery01",
		type: "gallery",
		title: "First gallery",
		description: "Some works 01",
		data: "2026-05-13",
		images: [
			{
				src: "../../public/media/pictures/pic1.png",
				width: 1200,
				height: 800,
			},
			{
				src: "../../public/media/pictures/pic2.png",
				width: 1200,
				height: 800,
			}
		]
	},
	{
		id: "video01",
		type: "video",
		title: "First video",
		description: "Some works 02",
		data: "2026-05-13",
		video_url: "../../public/media/videos/v1.mp4"
	}
] as const;