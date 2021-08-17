<template>
	<div class="page flex-col">
		<div class="Block-body">
			<!-- 左侧导航 -->
			<div class="">

				<div class="Left_Menu" :class="{ 'w-150': isCollapse }">
					<div class="menu-box" :class="isCollapse ? 'isCollapse' : ''">

						<div class="div-vertical" :collapse="isCollapse">
							<div class="menu-item" :class="{'isCollapse-pl': isCollapse,'active': menuIndex === 0}"
								@click="goToPage(0,'/')">
								<div class="iconbox1 meun-icon" style="width: 33px;"></div>
								<span class="menu-title">Market</span>
							</div>

							<div class="menu-item" :class="{'isCollapse-pl': isCollapse,'active': menuIndex === 1}"
								@click="goToPage(0,'/abi')">
								<div class="iconbox3 meun-icon"></div>
								<span class="menu-title">Farming</span>
							</div>

							<div class="menu-item" :class="{'isCollapse-pl': isCollapse,'active': menuIndex === 3}"
								@click="goToPage(0,'/a')">
								<div class="iconbox6 meun-icon"></div>
								<span class="menu-title">DAO</span>
							</div>
						</div>
					</div>
					<div class="switchBtnBox flex-col" @click="switchMenu">
						<template>
							<img class="pic" v-if="isCollapse" referrerpolicy="no-referrer"
								src="../assets/logo.png" />
							<img class="pic" v-else referrerpolicy="no-referrer"
								src="../assets/logo.png" />
						</template>
					</div>
					<div class="linksBox" :class="{ 'links-collapsed': isCollapse }">
						<!-- <a href="https://twitter.com/AmaraFinance" target="_blank">
            <img class="img" src="../assets/images/twitter.png"
          /></a> -->
						<a href="https://t.me/shovelfinance" target="_blank"><img class="img"
								src="../assets/logo.png" /></a>
						<!--  <a href="https://github.com/AmaraFinance" target="_blank"
            ><img class="img" src="../assets/images/github.png"
          /></a> -->
						<a href="https://discord.gg/zEMPXRnh" target="_blank"><img class="img"
								src="../assets/logo.png" /></a>
					</div>
					<!-- 切换导航栏 -->
				</div>
			</div>
			<!-- 右侧主体  -->
			<div class="Right_Main" :class="{ 'isCollapse-w': isCollapse }">
				<router-view />
			</div>
		</div>
	</div>
</template>

<script>
	import {
		mapState
	} from "vuex";
	// import wPopup from '@/components/w-popup/w-popup.vue';
	export default {
		data() {
			return {
				isCollapse: false,
				isLinkShow: false,
				// accountSelect: 0,
				maraDialogVisible: false,
				accountDialogVisible: false,
				tableData: [],
				maraWalletBalance: 0,
				rewardBlance: 0,
				basePrice: 0,
				isLoading: false,
				bindAccount: false,
				menuIndex: 0
			};
		},
		components: {
			wPopup
		},
		computed: {
			...mapState({
				account: (state) => state.Session.account
			}),
			accountShow() {
				if (this.account) {
					return (
						this.account.substr(0, 4) +
						"..." +
						this.account.substr(-2)
					);
				} else {
					return "Connect";
				}
			},
		},
		watch: {
			account() {
				if (this.account) {
					this.getRewardInfo();
					//get baseToken Price
					this.$unitroller.getBaseTokenPrice().then((price) => {
						this.basePrice = Number(price / Math.pow(10, 6)).toFixed(4);
					}).catch((err) => {
						console.log(err)
					})
				}
			},
			$route: {
				handler: function(val, oldVal) {
					this.switchMenuByPath(val.name)
				},
				// 深度观察监听
				deep: true
			},
		},
		mounted() {
			this.switchMenuByPath(this.$route.name)
		},
		methods: {
			switchMenuByPath(name) {
				switch (name) {
					case 'main':
						this.menuIndex = 0
						break;
					case 'farm':
						this.menuIndex = 1
						break;
					case 'bridge':
						this.menuIndex = 2
						break;
					case 'dao':
						this.menuIndex = 3
						break;
				}
			},
			goToPage(index, path) {
				this.menuIndex = index;
				this.$router.push({
					path: path
				})
			},
			copyAccount() {
				document.getElementsByClassName("copytxt")[0].value = this.account;
				var url = document.getElementsByClassName("copytxt")[0];
				url.select(); // 选择需要复制内容的对象
				document.execCommand("Copy"); // 执行浏览器复制命令
				this.$notify({
					title: 'Success',
					message: 'Account address copied',
					duration: 1200,
					type: 'success'
				});
			},
			getRewardInfo() {
				if (this.account) {
					let balance = 0;
					let decimal = 0;
					let reward = 0;
					let marketList = [];
					this.$amaraToken.eventualDecimals
						.then((decimal_) => {
							decimal = decimal_;
							return this.$unitroller.getMarketList();
						})
						.then((marketList_) => {
							marketList = marketList_;
							// return this.$LensLHB.calcAccountAllAccrued(
							//   this.account,
							//   marketList
							// );
						})
						.then((reward_) => {
							// this.rewardBlance = Number(reward_ / 10 ** decimal).toFixed(2);
							return this.$amaraToken.eventualBalanceOf(this.account);
						})
						.then((balance_) => {
							this.maraWalletBalance = Number(balance_ / 10 ** decimal).toFixed(
								2
							);
						}).catch(() => {

						});
				}
			},
			// 提取挖矿收益
			getReawrd() {
				this.isLoading = true;
				this.$unitroller
					.claimComp(this.account)
					.then((res) => {
						this.isLoading = false;
						this.$message({
							message: "Claim Success",
							type: "success",
						});
						this.maraDialogVisible = false;
						this.getRewardInfo();
					})
					.catch((err) => {
						console.log(err);
						this.isLoading = false;
						this.$message.error("Claim Fail");
						this.maraDialogVisible = false;
					});
			},
			rowClicked(row) {

			},

			async showAccoutDialog() {
				// if (this.account) {
				//   this.accountDialogVisible = true;
				// } else {
				//   if (this.substrateAddress) {
				//     let err = await this.$wallet.bindEvmAddress(this.substrateAddress);
				//     if (err && err.indexOf("1010") >= 0) {
				//       console.log("bindFail");
				//       this.$message.error('bind fail, your balance is low');
				//     }
				//     this.bindAccount = true;
				//   } else {
				//     window.open("https://polkadot.js.org/extension/");
				//   }
				// }
			},
			showMaraDialog() {
				this.maraDialogVisible = true;
			},
			handleClose(done) {
				this.maraDialogVisible = false;
			},
			handleClose1(done) {
				done();
			},
			switchMenu() {
				this.isCollapse = !this.isCollapse;
			},
		},
	};
</script>

<style lang="scss">
	body * {
		box-sizing: border-box;
	}

	// body {
	//   font-family: PingFangSC-Regular, Roboto, Helvetica Neue, Helvetica, Tahoma,
	//     Arial, PingFang SC-Light, Microsoft YaHei;
	// }

	button {
		margin: 0;
		padding: 0;
		border: 1px solid transparent;
		outline: none;
		background-color: transparent;
	}

	button:active {
		opacity: 0.6;
	}

	.flex-col {
		display: flex;
		flex-direction: column;
	}

	.w-150 {
		width: 150px !important;
	}

	.el-dialog__header {
		padding: 0 !important;
	}

	.Block-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		// height: 130px;
		padding: 35px 80px 35px 64px;
		box-sizing: border-box;
		background-color: #f6f6f6;

		.img1 {
			width: 146px;
			height: 60px;
		}

		.connectBox {
			width: 140px;
			height: 50px;
			background: var(--primary);
			border-radius: 25px;

			.connectTxt {
				cursor: pointer;
				font-size: 20px;
				font-family: PingFang Medium;
				font-weight: 500;
				color: #ffffff;
			}
		}
	}

	.Block-body {
		display: flex;
		justify-content: flex-end;

		// width: 100%;
		// height: 100%;


		.left150 {
			left: 150px !important;
		}


		.Left_Menu::after {
			content: '';
			position: absolute;
			width: 100%;
			height: 100%;
			left: 0;
			top: 0;
			box-shadow: 4px 4px 6px 0px rgba(15, 17, 19, 0.55);
			// box-shadow:inset 4px 4px 6px 0px rgba(15, 17, 19, 0.55);
			pointer-events: none;
			z-index: 999;
		}

		.Left_Menu {
			position: fixed;
			z-index: 999;
			left: 0;
			top: 0;
			float: left;
			padding-top: 35px;
			box-sizing: border-box;
			// display: flex;
			// justify-content: center;
			width: 270px;
			min-height: 100vh;
			background: linear-gradient(270deg, #2A4054 0%, #19202D 100%);

			.linksBox {
				position: absolute;
				bottom: 60px;
				left: 60px;
				box-sizing: border-box;
				display: flex;

				// justify-content: space-between;
				a {
					margin-right: 13px;
				}

				.img {
					// margin-right: 20px;
					width: 30px;
					height: 30px;
					cursor: pointer;
				}
			}

			.top-logo-box {
				height: 60px;
				display: flex;
				justify-content: center;

				.logo-img {
					width: 147px;
				}

				.logo-img1 {
					width: 60px;
				}

				.right {
					display: flex;
					flex-direction: column;
					margin-left: 10px;

					.amaraTxt {
						font-size: 20px;
						color: #050101;
					}

					.beta {
						margin-top: 6px;
						width: 65px;
						height: 26px;
						background: var(--primary);
						border-radius: 13px;
						opacity: 0.2;
						font-size: 16px;
						font-weight: 600;
						color: #ffffff;
						line-height: 26px;
						text-align: center;
					}
				}
			}

			.switchBtnBox {
				position: absolute;
				top: 50%;
				right: 0;
				transform: translate(100%, -50%);
				z-index: 29;
				width: 24px;
				height: 148px;
				justify-content: center;
				align-items: flex-end;
				cursor: pointer;

				.pic {
					width: 100%;
					height: 100%;
				}
			}

			.button-box {
				margin-top: 45px;

				.el-button {
					width: 120px;
					height: 40px;
					box-sizing: border-box;

					span {
						font-size: 18px;
						font-weight: 500;
						color: #ffffff;
					}
				}

				.el-button.is-round {
					padding: 8px 15px !important;
				}
			}

			.el-icon-copy-document {
				font-size: 16px;
			}

			.copytxt {
				position: absolute;
				top: 0;
				left: -10000px;
			}

			.accout-dialog {
				margin-top: 60px;
				width: 600px;
				border-radius: 20px;
				// border: 1px solid #F0F0F2;

				.el-table__row {
					cursor: pointer;
					height: 82px;

					td {
						&:nth-child(2) {
							font-size: 20px;
							font-weight: 600;
							color: #010101;
						}

						&:nth-child(3) {
							font-size: 18px;
							font-weight: 600;
							color: #9e9e9e;
						}
					}

					&:last-child td {
						border-bottom: none !important;
					}
				}

				.el-table__header tr th {
					border: none;
				}

				.el-table::before {
					height: 0px;
				}

				.el-table__body {
					width: auto !important;
					padding: 0 30px;
					box-sizing: border-box;
				}

				.el-table__body-wrapper {
					border-radius: 20px;
					border: 1px solid #ebeef5;
				}

				.title {
					font-size: 30px;
					font-family: PingFang Bold;
					font-weight: 600;
					color: #010101;
				}
			}

			.mara-box {
				margin-top: 17px;

				.mara {
					font-size: 18px;
					font-weight: 550;
					color: #FFFFFF;
				}

				.w-popup {
					.imgBox {
						margin-top: 40px;
						margin-bottom: 35px;
						display: flex;
						flex-direction: column;
						align-items: center;
						justify-content: center;

						img {
							width: 80px;
						}

						span {
							margin-top: 40px;
							font-size: 40px;
							font-family: PingFang Bold;
							font-weight: 600;
							color: var(--primary);
						}
					}

					.dataItem {
						padding-top: 25px;
						display: flex;
						justify-content: space-between;
						align-items: center;

						span {
							font-size: 20px;
							font-family: PingFang Bold;
							font-weight: 600;
							color: #FFFFFF;
						}
					}

					.submit-btn {
						margin-top: 40px;
						width: 100%;
						height: 70px;
						font-size: 22px;
						border-radius: 35px;
						background: linear-gradient(180deg, #FED32C 0%, #F7B148 100%);
					}
				}
			}

			.menu-box {
				margin-top: 64px;
				position: relative;
			}

			.div-vertical:not(.div--collapse) {
				width: 100%;
			}

			.menu-box {
				// width: 100%;
				border: none;
			}

			.menu-item {
				text-align: left;
				// width: 100%;
				display: flex;
				// justify-content: flex-start;
				align-items: center;
				// padding: 0 !important;
				padding-left: 60px;
				cursor: pointer;
				box-sizing: border-box;
				height: 70px;
				font-size: 18px;
				font-weight: 500;
				line-height: 25px;
				font-family: PingFang Medium;
				color: #9e9e9e;

				.meun-icon {
					margin-right: 20px;
					width: 30px;
					height: 30px;
					background-size: 100%;
					background-repeat: no-repeat;
					display: inline-block;
					flex: none;
				}

				.iconbox1 {
					background-image: url(../assets/images/market.png);
				}

				.iconbox2 {
					background-image: url(../assets/images/innovation.png);
				}

				.iconbox3 {
					background-image: url(../assets/images/farm.png);
				}

				.iconbox4 {
					background-image: url(../assets/images/defi.png);
				}

				.iconbox5 {
					background-image: url(../assets/images/nft.png);
				}

				.iconbox6 {
					background-image: url(../assets/images/dao.png);
				}

				.iconbox7 {
					background-image: url(../assets/images/bridge.png);
				}
			}

			.menu-box.isCollapse .menu-item {
				padding-right: 63px !important;
			}

			.menu-box.isCollapse .menu-item .menu-title {
				display: none;
			}

			.menu-box.isCollapse .menu-item {
				padding-right: 63px !important;
			}

			.menu-item.active,
			.menu-item:focus,
			.menu-item:hover {
				color: #ffffff;
				background: linear-gradient(270deg, rgba(254, 212, 42, 0.04) 0%, #F8B348 100%);

				.el-tooltip i {
					color: #ffffff;
					background-color: var(--primary);
				}

				.iconbox1 {
					background-image: url(../assets/images/market-s.png);
				}

				.iconbox2 {
					background-image: url(../assets/images/innovation-s.png);
				}

				.iconbox3 {
					background-image: url(../assets/images/farm-s.png);
				}

				.iconbox4 {
					background-image: url(../assets/images/defi-s.png);
				}

				.iconbox5 {
					background-image: url(../assets/images/nft-s.png);
				}

				.iconbox6 {
					background-image: url(../assets/images/dao-s.png);
				}

				.iconbox7 {
					background-image: url(../assets/images/bridge-s.png);
				}
			}



			.links-collapsed {
				margin-top: 13px;
				display: flex;
				flex-direction: column;

				.img {
					margin-bottom: 15px;
				}
			}
		}

		.Right_Main {
			width: calc(100% - 270px);
			padding: 42px 54px;
			min-height: 100vh;
			box-sizing: border-box;
			background: #2d465e;
		}

		.isCollapse-w {
			width: calc(100% - 150px);
		}

		.el-dialog__header {
			padding-top: 0;
			position: relative;
		}

		.el-dialog__body {
			padding: 0 !important;
			// padding: 30px 50px 60px;
		}
	}
</style>
