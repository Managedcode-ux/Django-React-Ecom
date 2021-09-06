import React, {useState,useEffect} from "react"
import { Redirect } from "react-router-dom"
import { cartEmpty } from "./helper/cartHelper" 
import {getmeToken, processPayment} from "./helper/paymentHelper"
import {createOrder} from "./helper/orderHelper"
import {isAuthenticated, signout} from "../auth/helper"

import DropIn from "braintree-web-drop-in-react"

const PaymentB = ({
    products, 
    reload = undefined,
    setReload = f => f,
}) =>{


    const [info, setInfo] = useState({
        loading  : false,
        success : false,
        clientToken : null,
        error : "",
        instance: {},
    })

    const userId = isAuthenticated && isAuthenticated().user.id;
    const token = isAuthenticated && isAuthenticated().token;

    const getToken = (userId, token) =>{
        getmeToken(userId, token)
        .then(info => {
            if(info.error){
                setInfo({
                    ...info,
                    error:info.error
                })
                signout(() =>{
                    return <Redirect to="/"/>
                })
            }
            else{
                const clientToken = info.ClientToken
                setInfo({clientToken})
            }
        })
    }

    useEffect(() =>{
        getToken(userId, token)
    },[])

    const getAmount = () =>{
        let amount=0;
        products.map(p =>{
            amount = amount + parseInt(p.price)
        })
        return amount
    }

    const onPurchase = () =>{
        setInfo({loading:true})
        let nonce;
        let getNonce = info.instance.requestPaymentMethod()
        .then(
            data =>{
                console.log("MYDATA", data);
                nonce = data.nonce
                const paymentData  ={
                    paymentMethodNonce : nonce,
                    amount: getAmount()
                };
                processPayment=(userId,token,paymentData)
                .then(responce => {
                    console.log("POINT-1", responce);
                    if(responce.error ){
                        if(responce.code =="1"){
                            console.log("Payment failed")
                            signout(() => {
                                return <Redirect to='/'/>
                            })
                        }
                    }
                    else{
                        setInfo({...info,
                        success:responce.success, loading:false
                    })
                    console.log("Payment Success")
                    let product_names = ""
                    products.forEach(function(item){
                        product_names += item.name + ","
                    })
                    const orderData = {
                        products: product_names,
                        transaction_id: responce.transaction_id,
                        amount: responce.transaction.amount
                    }
                    createOrder(userId, token, orderData)
                    .then(responce => {
                        if(responce.error){
                            if(responce.code == "1"){
                                console.log("Order failed")
                            }
                            signout(() => {
                                return <Redirect to="/"/>
                            })
                        }
                        else{
                            if(responce.success ==true){
                                console.log("Order Placed")
                            }
                        }
                    })
                    .catch(error =>{
                        setInfo({loading:false, success:false})
                        console.log("Order Failed :-", error)
                    })
                    cartEmpty(() => {
                        console.log("Cart Cleaned")
                    })

                    setReload(!reload)
                    }
                })
                .catch(e => console.log(e))
            }
        )
        .catch(e => console.log("Nonce ",e))
    }

    const showbtnDropIn = () =>{
        return(
            <div>
                {
                    info.clientToken !== null && products.length>0? 
                    (
                        <div>
                            <DropIn
                            options = {{authorization:info.clientToken}}
                            onInstance = {(instance) => (info.instance = instance)}
                            ></DropIn>
                            <button onClick={onPurchase} className="btn btn-block btn-success"> buy now</button>
                            
                            
                        </div>
                    ):
                    (
                        <h3>please login first or add something in cart</h3>
                    )
                }
            </div>
        )
    }

    return(
        <div>
            <h3>Your Bill is {getAmount()} $</h3>
            {showbtnDropIn()}
        </div>
    )
}

export default PaymentB;



