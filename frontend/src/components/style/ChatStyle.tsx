import styled from "styled-components";

export const ChatStyle = styled.div`
	display: flex;
	width: 80vw;
	height: 80vh;
	max-width: 900px;
	border: 1px solid #0b6100;
	border-radius: 10px;
	
	.left {
		width: 30%;
		margin: 30px 0 30px 30px;
		border: 1px solid #0b6100;
		border-radius: 8px;
		padding: 10px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.right {
		flex: 1;
		margin: 30px;
		border: 1px solid #0b6100;
		border-radius: 8px;
		padding: 10px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}


`;
