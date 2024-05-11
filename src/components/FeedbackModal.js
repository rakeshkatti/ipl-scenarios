import React from "react";
import { Modal, Form, Input, Select, message } from "antd";
import supabase from "../supabaseClient";

const FeedbackModal = ({ isModalOpen, setIsModalOpen, table }) => {
	const showModal = () => {
		setIsModalOpen(true);
	};
	const handleOk = () => {
		setIsModalOpen(false);
	};
	const handleCancel = () => {
		setIsModalOpen(false);
	};

	const handleSubmit = async () => {
		try {
			// Validate only the necessary fields
			await form.validateFields();
			const values = form.getFieldsValue();

			console.log("Received values of form: ", values);

			// Send the data to Supabase
			const { data, error } = await supabase.from("user_feedback").insert([
				{
					name: values.name, // Optional field, no validation
					email: values.email, // Required with validation
					team: values.team, // Required with validation
					feedback: values.feedback, // Optional field, no validation
				},
			]);

			if (error) {
				throw error;
			}

			message.success("Feedback submitted successfully!");

			// Reset form after successful submission
			form.resetFields();
			sessionStorage.setItem("feedbackSubmitted", "true");
			handleOk();
		} catch (error) {
			console.error("Submission Failed:", error.message);
			message.error("Failed to submit feedback");
		}
	};

	const [form] = Form.useForm();
	return (
		<Modal
			title="Thank you for using IPL Scenarios"
			open={isModalOpen}
			onOk={handleSubmit}
			onCancel={() => {
				handleCancel();
				form.resetFields(); // Reset form when cancelling
			}}
			okText="Submit"
			cancelText="Cancel"
		>
			<Form form={form} layout="vertical">
				<Form.Item
					name="team"
					label="Your Favorite Team"
					rules={[{ required: true, message: "Please select your team!" }]}
				>
					<Select placeholder="Select a team">
						{Object.keys(table).map((t) => (
							<Select.Option key={t} value={t}>
								{t.toUpperCase()}
							</Select.Option>
						))}
					</Select>
				</Form.Item>
				<Form.Item requiredMark="optional" name="name" label="Name">
					<Input />
				</Form.Item>
				<Form.Item
					requiredMark="optional"
					name="email"
					label="Email (for updates on new apps)"
					rules={[
						{
							type: "email",
							message: "Please input a valid email!",
						},
					]}
				>
					<Input />
				</Form.Item>
				<Form.Item
					requiredMark="optional"
					name="feedback"
					label="Feedback or Suggestions for Next League"
				>
					<Input.TextArea />
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default FeedbackModal;
