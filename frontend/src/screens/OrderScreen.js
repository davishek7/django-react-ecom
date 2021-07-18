import React, { useEffect, useState } from "react";
import { Button, Row, Col,ListGroup,Image,Card } from "react-bootstrap";
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from "react-redux";
import Message from "../components/Message";
import Loader from "../components/Loader";
import { getOrderDetails,payOrder } from '../actions/orderActions'


function OrderScreen({ match }) {

    const orderId = match.params.id

    const dispatch = useDispatch()

    const [sdkReady,setSdkReady] = useState(false)

    const orderDetails = useSelector(state => state.orderDetails)
    const{order,error,loading} = orderDetails

    const orderPay = useSelector(state => state.orderPay)
    const{loading:loadingPay,success:successPay} = orderPay

    if(!loading && !error){
        order.itemsPrice = order.orderItems.reduce((acc,item)=> acc + item.price * item.qty,0).toFixed(2)
    }

    const addPayPalScript = () =>{
        const script = document.createElement('script')
        script.type = 'text/javascript'
        script.src = 'https://www.paypal.com/sdk/js?client-id=AQRXZ8AA9JbUbb6XnmIhTee8V_aFkHHN8yFv9X_yVV09SFmpgnkj2gLXw_hoRLNIebn8i1kM-0rqJa0B'
        script.async = true
        script.onload = () => {
            setSdkReady(true)
        }
        document.body.appendChild(script)
    }

    useEffect(()=>{
        if(!order || successPay || order._id !== Number(orderId)){
            dispatch(getOrderDetails(orderId))
        }else if(!order.isPaid){
            if(!window.paypal){
                addPayPalScript()
            }else{
                sdkReady(true)
            }
        }
    },[order,orderId,successPay])

    const successPaymentHandler = (paymentResult)=>{
        dispatch(payOrder(orderId,paymentResult))
    }

    return loading ?
    (
        <Loader/>
    ): error ? (
        <Message variant='danger' children={error}/>
    ):(
        <div>
            <h1>Order: {order._id}</h1>
            <Row>
                <Col md={8}>
                    <ListGroup variant="flush">
                        <ListGroup.Item>
                            <h2>Shipping</h2>
                            <p><strong>Name: </strong>{order.user.name}</p>
                            <p><strong>Email: </strong><a href={`mailto:${order.user.email}`}>{order.user.email}</a></p>
                            <p>
                                <strong>Shipping: </strong>
                                {order.shippingAddress.address},{order.shippingAddress.city},
                                {' '}
                                {order.shippingAddress.postalCode},
                                {' '}
                                {order.shippingAddress.country}
                            </p>
                            <p>
                                {order.isDelivered ?(
                                    <Message variant='success'>Paid on {order.deleveredAt}</Message>
                                ):(
                                    <Message variant='warning'>Not delivered</Message>
                                )}
                            </p>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <h2>Payment Method</h2>
                            <p>
                                <strong>Payment Method: </strong>
                                {order.paymentMethod}
                            </p>
                            <p>
                                {order.isPaid ?(
                                    <Message variant='success'>Paid on {order.paidAt}</Message>
                                ):(
                                    <Message variant='warning'>Not paid</Message>
                                )}
                            </p>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <h2>Order Items</h2>
                            {order.orderItems.length === 0 ? <Message variant='info' children='Your order is empty'/> : (
                                <ListGroup variant='flush'>
                                    {order.orderItems.map((item,index)=>(
                                        <ListGroup.Item key={index}>
                                            <Row>
                                                <Col md={1}>
                                                    <Image src={item.image} alt={item.name} fluid rounded />
                                                </Col>
                                                <Col>
                                                    <Link to={`/product/${item.product}`}>{item.name}</Link>
                                                </Col>
                                                <Col md={4}>
                                                    {item.qty} &times; ${item.price} = ${(item.qty * item.price).toFixed(2)}
                                                </Col>
                                            </Row>
                                        </ListGroup.Item>
                                    ))}

                                </ListGroup>
                            )}
                        </ListGroup.Item>
                    </ListGroup>
                </Col>
                <Col md={4}>
                    <Card>
                        <ListGroup variant='flush'>
                            <ListGroup.Item>
                                <h2>Order Summary</h2>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Item: </Col>
                                    <Col>₹ {order.itemsPrice}</Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Shipping: </Col>
                                    <Col>₹ {order.shippingPrice}</Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Total: </Col>
                                    <Col>₹ {order.totalPrice}</Col>
                                </Row>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default OrderScreen
