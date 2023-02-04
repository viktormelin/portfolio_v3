import { useEffect, useState } from 'react';

interface Projects {
	title: string;
	stack: string[];
	repo: string;
	live?: string;
}

interface Data {
	loading: boolean;
	data: Projects[];
}

const useProjects = () => {
	const [data, setData] = useState<Data>({
		loading: true,
		data: [],
	});

	// useEffect(() => {
	// 	setData();
	// }, []);

	return data;
};

export default useProjects;
