import React from 'react'
export default class ErrorBoundary extends React.Component {
constructor(props) {
super(props)
this.state = { hasError: false, message: '' }
}
static getDerivedStateFromError(error) { return { hasError: true, message: error?.message || 'Unexpected error' } }
componentDidCatch(error, info) { console.error('Render error:', error, info) }
render() {
if (this.state.hasError) {
return (
<div className="card p-4 mt-4 text-sm text-red-700">
<div className="font-semibold">Something went wrong rendering the UI.</div>
<div className="text-slate-700">{this.state.message}</div>
</div>
)
}
return this.props.children
}
}
