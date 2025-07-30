import type { HandleClientError } from '@sveltejs/kit';
import { browser } from '$app/environment';

export const handleError: HandleClientError = async ({ error, event, status, message }) => {
	console.error('Client error details:', {
		error: error instanceof Error ? {
			message: error.message,
			stack: error.stack
		} : error,
		status,
		message,
		url: event.url.href,
		pathname: event.url.pathname,
		routeId: event.route.id
	});

	// Check if this is a JSON parsing error
	if (error instanceof Error && error.message.includes('Unexpected token')) {
		console.error('JSON parsing error detected. This usually means the server returned HTML instead of JSON.');
		console.error('Route causing issue:', event.route.id);
		console.error('URL:', event.url.href);
		
		// Don't redirect automatically, let's see what's happening
		return {
			message: 'Error loading data. Please refresh the page.'
		};
	}

	// Log any network errors
	if (error instanceof Error && error.message.includes('NetworkError')) {
		console.error('Network error detected');
	}

	return {
		message: message || 'An unexpected error occurred'
	};
};