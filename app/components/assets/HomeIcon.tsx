import React from 'react';

type HomeIconProps = {
	isSelected: boolean;
	className?: string;  // Add the optional className prop
}

const HomeIcon: React.FC<HomeIconProps> = ({ isSelected, className }) => {
	return (
		<svg
			version="1.1"
			id="Capa_1"
			xmlns="http://www.w3.org/2000/svg"
			x="0px"
			y="0px"
			viewBox="0 0 512 512"
			className={className}
		>
			<g fill={isSelected ? "#f84f03" : "#7f7f7f"}>
				<g>
					<path d="M 504.2 237.4 L 295.8 27.6 c -0.3 -0.3 -0.5 -0.5 -0.8 -0.8 c -22.8 -20.4 -57.1 -20.5 -80 -0.2 c -0.3 0.3 -0.6 0.5 -0.8 0.8 L 3.9 237.4 c -7.8 7.8 -7.8 20.5 0 28.3 c 7.8 7.8 20.5 7.8 28.3 0 L 48 249.8 v 172.7 c 0 44.1 35.9 80 80 80 h 72 c 11 0 20 -9 20 -20 v -163 h 70 v 163 c 0 11 9 20 20 20 h 70 c 44.1 0 80 -35.9 80 -80 c 0 -11 -9 -20 -20 -20 c -11 0 -20 9 -20 20 c 0 22.1 -17.9 40 -40 40 h -50 v -163 c 0 -11 -9 -20 -20 -20 H 200 c -11 0 -20 9 -20 20 v 163 h -52 c -22.1 0 -40 -17.9 -40 -40 v -212 c 0 -0.2 0 -0.4 0 -0.6 L 241.9 56.3 c 7.5 -6.4 18.5 -6.3 25.9 0.1 L 420 209.4 v 113.1 c 0 11 9 20 20 20 c 11 0 20 -9 20 -20 v -72.8 l 15.8 15.9 c 3.9 3.9 9 5.9 14.2 5.9 c 5.1 0 10.2 -1.9 14.1 -5.8 C 511.9 257.9 512 245.2 504.2 237.4 z" />
				</g>
			</g>
			<g>
			</g>
			<g>
			</g>
			<g>
			</g>
			<g>
			</g>
			<g>
			</g>
			<g>
			</g>
			<g>
			</g>
			<g>
			</g>
			<g>
			</g>
			<g>
			</g>
			<g>
			</g>
			<g>
			</g>
			<g>
			</g>
			<g>
			</g>
			<g>
			</g>
		</svg>
	)
}

export default HomeIcon;