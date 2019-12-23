// import ajax from '@liepin/ajax';

const onEnter = title => {
  if (title) {
    try {
      let doc = window.top ? window.top.document : document;
      doc.title = title;
    } catch (e) {}
  }

  // 检测是否有未录入的工作记录 TODO 是否需要检验？
  //   if (!/view-effective-input-records/gi.test(window.location.href)) {
  //     ajax({
  //       url: '//rpo.lietou.com/calendar/undealcnt.json',
  //       dataType: 'jsonp',
  //       crossDomain: true,
  //       success({ flag, data, msg }) {
  //         if (flag === 1) {
  //           if (data > 0) {
  //             window.location.href = 'http://rpo.lietou.com/homepage/';
  //           }
  //         } else {
  //           alert('获取未录入数量失败！');
  //         }
  //       }
  //     });
  //   }

  // 处理ie兼容性提示
  if (window.ActiveXObject) {
    if (/10\.0/.test(navigator.userAgent)) {
      alert('此页面只支持ie10+，google，safari，火狐等高版本浏览器！');
    }
  }

  const isIeLt10 = /(8|9)\./i.test(window.navigator.appVersion);
  if (window.navigator.appName === 'Microsoft Internet Explorer' && isIeLt10) {
    alert('此页面只支持ie10+，google，safari，火狐等高版本浏览器！');
  }
};

export default onEnter;
