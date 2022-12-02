import { Box, 
		 Grid, 
		 Stack, 
		 Text, 
		 Input, 
		 FormControl, 
		 FormLabel, 
		 FormHelperText,
		 NumberInput,
		 NumberInputField,
		 Button
		 } from '@chakra-ui/core';
import { useState, createContext } from 'react';
import TaskCard from '../components/TaskCard';
import BoxTarget from '../components/BoxTarget';
import { useDrop } from 'react-dnd';
import { ItemTypes } from '../utils/items';
import axios from 'axios';

const url = "http://localhost:3000/api/task";

export const CardContext = createContext({
	markAsDone: null,
});

const Tasks = (props) => {
	const [taskList, setTaskList] = useState(props.tasks);
	const [task, setTask] = useState({ title: "", point: "", status: "wip" });

	const markAsDone = async (id) => {
		try {
			const originalTasks = [...taskList];
			const index = originalTasks.findIndex((t) => t.id === task._id);
			const { data } = await axios.put(url + "/" + id, { status: "done" });
			originalTasks[index] = data.data;
			setTaskList(originalTasks);
			console.log(data.message);
		} catch (error) {
			console.log(error);
		}
	}

	const markAsAvailable = async (id) => {
		try {
			const originalTasks = [...taskList];
			const index = originalTasks.findIndex((t) => t.id === task._id);
			const { data } = await axios.put(url + "/" + id, { status: "wip" });
			originalTasks[index] = data.data;
			setTaskList(originalTasks);
			console.log(data.message);
		} catch (error) {
			console.log(error);
		}
	};

	const [{ isOver }, drop] = useDrop({
		accept: ItemTypes.CARD,
		drop: (item, monitor) => markAsAvailable(item.id),
		collect: monitor => ({
			isOver: !!monitor.isOver(),
		}),
	});

	const handleChange = ({ currentTarget: input}) => {
		input.value === ""
			? setTask({ title: "" })
			: setTask((prev) => ({ ...prev, title: input.value}));
	}

	const handleChangePoint = ({ currentTarget: input}) => {
		input.value === ""
			? setTask({ point: "" })
			: setTask((prev) => ({ ...prev, point: input.value}));
	}

	const editTask = (id) => {
		const currentTask = taskList.filter((task) => task._id === id);
		setTask(currentTask[0]);
	}

	const addTask = async (e) => {
		e.preventDefault();
		try {
			if (task._id) {
				const { data } = await axios.put(url + "/" + task._id, { title: task.title, point: task.point });
				const originalTasks = [...taskList];
				const index = originalTasks.findIndex((t) => t.id === task._id);
				originalTasks[index] = data.data;
				setTaskList(originalTasks);
				setTask({ task: "" });
				console.log(data.message);
			} else {
				const { data } = await axios.post(url, task);
				setTaskList((prev) => [...prev, data.data]);
				setTask({ task: "" });
				console.log(data.message);
			}
		} catch (error) {
			console.log(error);
		}
	}

	const updateTask = async (id) => {
		try {
			const originalTasks = [...taskList];
			const index = originalTasks.findIndex((t) => t.id === task._id);
			const { data } = await axios.put(url + "/" + id, { completed: !originalTasks[index].completed });
			originalTasks[index] = data.data;
			setTaskList(originalTasks);
			console.log(data.message);
		} catch (error) {
			console.log(error);
		}
	}

	const deleteTask = async (id) => {
		try {
			const { data } = await axios.delete(url + "/" + id);
			setTaskList((prev) => prev.filter((task) => task._id !== id ));
			console.log(data.message);
		} catch (error) {
			console.log(error);
		}
	}

	return (
		<Grid
			gap={6}
			templateColumns='1fr 3fr'
			bg='gray.700'
			w='100vw'
			h='93vh'
			p={3}>
			<CardContext.Provider value={{ markAsAvailable }}>
				<Box ref={drop} bg={isOver ? 'cyan.200' : 'cyan.100'} rounded='md' p={3} boxShadow='md'>
					<Stack spacing={3}>
						<Text fontSize='2xl' textAlign='center'>
							Cyber Security Catalogue
						</Text>
						{taskList.length === 0 && <Text fontSize='' textAlign='center'>No items</Text>}
						{taskList
							.filter((task, i) => task.status === 'wip')
							.map((task, i) => (
								<>
								<TaskCard
									key={task._id.toString()}
									_id={task._id}
									point={task.point}
									title={task.title}
								/>
								<Button
									onClick={() => deleteTask(task._id)}
								>
									&#10006; Delete
								</Button>
								</>
						))}
					</Stack>

					<Stack spacing={3} p={3}>
						<Text fontSize='2xl' textAlign='center'>
							Add New Item
						</Text>
						<form onSubmit={addTask}>
							<FormControl isRequired>
								<FormLabel>Title</FormLabel>
								<Input type='text' placeholder='title' onChange={handleChange} />
								<FormHelperText></FormHelperText>
							</FormControl>
							<FormControl isRequired>
								<FormLabel>Point</FormLabel>
								<NumberInput min={0}>
									<NumberInputField onChange={handleChangePoint}/>
								</NumberInput>
							</FormControl>
							<Button
								mt={4}
								colorScheme='blue'
								type='submit'
							>
								Submit
							</Button>
						</form>
					</Stack>
				</Box>
			</CardContext.Provider>
			
			<CardContext.Provider value={{ markAsDone }}>
				<Box bg='blue.200' rounded='md' p={3} boxShadow='md'>
					<Stack>
						<Text fontSize='2xl' textAlign='center'>
							Choosen Items
						</Text>
						<BoxTarget>
							{taskList
								.filter((task, i) => task.status === 'done')
								.map((task, i) => (
									<TaskCard
										key={task._id.toString()}
										_id={task._id}
										point={task.point}
										title={task.title}
									/>
								))}
						</BoxTarget>
					</Stack>
				</Box>
			</CardContext.Provider>
		</Grid>
	);
};

export default Tasks;

export const getServerSideProps = async() => {
	try {
		const { data } = await axios.get(url);
		return { 
			props: {
				tasks: data.data,
			},
		};
	} catch (error) {
		return error.response.data;
	}
}
