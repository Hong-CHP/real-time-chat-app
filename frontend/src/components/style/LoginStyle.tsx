import styled from 'styled-components';

export const InputBox = styled.div`
	display: flex;
	flex-direction: column;
	gap: 4px;
`;

export const LoginStyle = styled.div`
	width: 300px;
		
	.extern {
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	input, button {
		height: 38px;
		border-radius: 5px;
		border: none;
	}
`;

export const ErrorText = styled.div`
	margin: 4px;
	color: red;
`;
