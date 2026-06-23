const fs = require('fs');
let content = fs.readFileSync('app/page.js', 'utf8');

content = content.replace(
`      setTrackingOrder(order);
      setIsTrackingOpen(true);`,
`      setTrackingOrder(order);
      setIsTrackingOpen(true);
      if (typeof window !== 'undefined') localStorage.setItem('trackingOrderId', order.id);`
);

content = content.replace(
`              setTrackingOrder(null);
              setIsTrackingOpen(false);
            }, 35 * 60 * 1000); // 35 dakika sonra butonu ve ekranı gizle`,
`              setTrackingOrder(null);
              setIsTrackingOpen(false);
              if (typeof window !== 'undefined') localStorage.removeItem('trackingOrderId');
            }, 35 * 60 * 1000); // 35 dakika sonra butonu ve ekranı gizle`
);

content = content.replace(
`      } catch (e) {
        console.error(e);
      }
    }, 10000);
  };

  const getTrackingFabData = () => {`,
`      } catch (e) {
        console.error(e);
      }
    }, 10000);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedOrderId = localStorage.getItem('trackingOrderId');
    if (savedOrderId && !trackingOrder) {
      fetch(\`/api/orders?track=\${savedOrderId}\`)
        .then(res => res.json())
        .then(data => {
          if (data && data.id) {
            setTrackingOrder(data);
            if (data.status !== 'delivered') {
              pollOrderStatus(savedOrderId);
            } else {
              localStorage.removeItem('trackingOrderId');
            }
          } else {
            localStorage.removeItem('trackingOrderId');
          }
        })
        .catch(console.error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getTrackingFabData = () => {`
);

fs.writeFileSync('app/page.js', content);
console.log('Done');
